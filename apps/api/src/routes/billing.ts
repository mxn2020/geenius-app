import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { ConvexHttpClient } from "convex/browser"
import { authMiddleware } from "../middleware/auth.js"
import { StripeService } from "../services/stripe.js"
import { ok, err } from "../lib/response.js"
import { AppError } from "../lib/errors.js"
import { env } from "../env.js"

const convex = new ConvexHttpClient(env.CONVEX_URL ?? "")
const stripe = new StripeService(env.STRIPE_SECRET_KEY ?? "")

export const billingRouter = new Hono()

const CheckoutSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

billingRouter.post(
  "/projects/:id/billing/checkout-session",
  authMiddleware,
  zValidator("json", CheckoutSchema),
  async (c) => {
    try {
      const projectId = c.req.param("id")
      const { priceId, successUrl, cancelUrl } = c.req.valid("json")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const project = await convex.query("projects:getProject" as any, { id: projectId })
      if (!project) return err(c, new AppError("NOT_FOUND", "Project not found", 404))
      const userId = c.get("userId") as string
      const customer = await stripe.createCustomer(`${userId}@geenius.dev`, userId)
      const session = await stripe.createCheckoutSession(
        customer.id,
        priceId,
        projectId,
        successUrl,
        cancelUrl
      )
      return ok(c, { url: session.url })
    } catch (e) {
      return err(c, e)
    }
  }
)

billingRouter.get("/projects/:id/billing", authMiddleware, async (c) => {
  try {
    const projectId = c.req.param("id")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = await convex.query("subscriptions:getByProject" as any, { projectId })
    return ok(c, { subscription: subscription ?? null })
  } catch (e) {
    return err(c, e)
  }
})

billingRouter.post("/webhook/stripe", async (c) => {
  try {
    const signature = c.req.header("stripe-signature")
    if (!signature) {
      return err(c, new AppError("MISSING_SIGNATURE", "Missing stripe-signature", 400))
    }
    const rawBody = await c.req.text()
    const event = stripe.verifyWebhookSignature(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET ?? ""
    )

    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object as {
          subscription?: string
          lines?: { data: Array<{ price?: { id?: string }; period?: { start: number; end: number } }> }
          customer?: string
        }
        const subId = invoice.subscription
        if (!subId) break
        const line = invoice.lines?.data?.[0]
        const priceId = line?.price?.id ?? ""
        const periodStart = (line?.period?.start ?? Math.floor(Date.now() / 1000)) * 1000
        const periodEnd = (line?.period?.end ?? Math.floor(Date.now() / 1000) + 2592000) * 1000

        // Get projectId from subscription metadata via Stripe
        const sub = await stripe.getSubscription(subId)
        const projectId = sub.metadata?.projectId ?? ""

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await convex.mutation("subscriptions:upsert" as any, {
          projectId,
          stripeSubscriptionId: subId,
          stripePriceId: priceId,
          status: "active",
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        })

        // Unsuspend project
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const project = await convex.query("projects:getProject" as any, { id: projectId })
        if (project?.status === "suspended") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await convex.mutation("projects:updateProjectStatus" as any, { id: projectId, status: "live" })
        }

        // Reset AI credits if AI plan
        if (project?.plan === "ai") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await convex.mutation("ai:resetAllowancePeriod" as any, {
            projectId,
            periodStart,
            periodEnd,
            creditsGranted: 10000,
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as { subscription?: string }
        const subId = invoice.subscription
        if (!subId) break
        const graceUntil = Date.now() + 7 * 24 * 60 * 60 * 1000
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await convex.mutation("subscriptions:setGracePeriod" as any, {
          stripeSubscriptionId: subId,
          graceUntil,
        })
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as {
          id: string
          metadata?: { projectId?: string }
          items?: { data: Array<{ price?: { id?: string } }> }
          status: string
          current_period_start: number
          current_period_end: number
        }
        const projectId = sub.metadata?.projectId ?? ""
        const priceId = sub.items?.data?.[0]?.price?.id ?? ""
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await convex.mutation("subscriptions:upsert" as any, {
          projectId,
          stripeSubscriptionId: sub.id,
          stripePriceId: priceId,
          status: sub.status,
          currentPeriodStart: sub.current_period_start * 1000,
          currentPeriodEnd: sub.current_period_end * 1000,
        })
        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as {
          id: string
          metadata?: { projectId?: string }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const projectId = await convex.mutation("subscriptions:cancelByStripeSubscriptionId" as any, {
          stripeSubscriptionId: sub.id,
        })
        if (projectId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await convex.mutation("projects:updateProjectStatus" as any, {
            id: projectId,
            status: "suspended",
          })
        }
        break
      }

      default:
        break
    }

    return c.json({ received: true })
  } catch (e) {
    return err(c, e)
  }
})
