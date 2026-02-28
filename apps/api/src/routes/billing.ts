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
    // Handle key events
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // TODO: sync subscription status to Convex
        break
      default:
        break
    }
    return c.json({ received: true })
  } catch (e) {
    return err(c, e)
  }
})
