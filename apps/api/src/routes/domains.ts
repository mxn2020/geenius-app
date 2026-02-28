import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { ConvexHttpClient } from "convex/browser"
import { authMiddleware } from "../middleware/auth.js"
import { NamecheapService } from "../services/namecheap.js"
import { StripeService } from "../services/stripe.js"
import { ok, err } from "../lib/response.js"
import { AppError } from "../lib/errors.js"
import { env } from "../env.js"

const convex = new ConvexHttpClient(env.CONVEX_URL ?? "")
const namecheap = new NamecheapService(
  env.NAMECHEAP_API_USER ?? "",
  env.NAMECHEAP_API_KEY ?? "",
  env.NAMECHEAP_CLIENT_IP ?? ""
)
const stripe = new StripeService(env.STRIPE_SECRET_KEY ?? "")

export const domainsRouter = new Hono()

const PurchaseSchema = z.object({
  domainName: z.string().min(4),
  paymentMethodId: z.string(),
})

const ConfirmSchema = z.object({
  paymentIntentId: z.string(),
  domainName: z.string(),
})

domainsRouter.get("/domains/search", authMiddleware, async (c) => {
  try {
    const query = c.req.query("query")
    if (!query) return err(c, new AppError("MISSING_QUERY", "query param required", 400))
    // Generate suggestions based on query
    const tlds = [".com", ".io", ".dev", ".app", ".co"]
    const candidates = tlds.map((tld) => `${query}${tld}`)
    const results = await namecheap.checkAvailability(candidates)
    return ok(c, results)
  } catch (e) {
    return err(c, e)
  }
})

domainsRouter.post(
  "/projects/:id/domains/purchase",
  authMiddleware,
  zValidator("json", PurchaseSchema),
  async (c) => {
    try {
      const projectId = c.req.param("id")
      const { domainName } = c.req.valid("json")
      const priceCents = await namecheap.getPrice(domainName)
      const intent = await stripe.createPaymentIntent(priceCents, "usd", {
        projectId,
        domainName,
        type: "domain_purchase",
      })
      return ok(c, { clientSecret: intent.client_secret, amountCents: priceCents }, 201)
    } catch (e) {
      return err(c, e)
    }
  }
)

domainsRouter.post(
  "/projects/:id/domains/purchase/confirm",
  authMiddleware,
  zValidator("json", ConfirmSchema),
  async (c) => {
    try {
      const projectId = c.req.param("id")
      const { domainName } = c.req.valid("json")
      await namecheap.purchaseDomain(domainName, 1)
      const priceCents = await namecheap.getPrice(domainName)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const domainId = await convex.mutation("domains:createDomain" as any, {
        projectId,
        domainName,
        purchasePriceCents: priceCents,
        renewalPriceCents: priceCents,
      })
      return ok(c, { domainId }, 201)
    } catch (e) {
      return err(c, e)
    }
  }
)

domainsRouter.get("/projects/:id/domains", authMiddleware, async (c) => {
  try {
    const projectId = c.req.param("id")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domains = await convex.query("domains:listDomains" as any, { projectId })
    return ok(c, domains)
  } catch (e) {
    return err(c, e)
  }
})
