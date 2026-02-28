import { Hono } from "hono"

export const webhooksRouter = new Hono()

webhooksRouter.post("/stripe", async (c) => {
  const signature = c.req.header("stripe-signature")
  if (!signature) {
    return c.json({ error: "Missing stripe-signature header" }, 400)
  }
  // Webhook handling will be implemented with Stripe SDK
  return c.json({ received: true })
})
