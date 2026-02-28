import Stripe from "stripe"

export class StripeService {
  private stripe: Stripe

  constructor(secretKey: string) {
    this.stripe = new Stripe(secretKey)
  }

  async createCustomer(email: string, userId: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({ email, metadata: { userId } })
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    projectId: string
  ): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: { projectId },
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    })
  }

  async updateSubscription(subId: string, newPriceId: string): Promise<Stripe.Subscription> {
    const sub = await this.stripe.subscriptions.retrieve(subId)
    return this.stripe.subscriptions.update(subId, {
      items: [{ id: sub.items.data[0]?.id, price: newPriceId }],
      proration_behavior: "always_invoice",
    })
  }

  async cancelSubscription(subId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.cancel(subId)
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    projectId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    return this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { projectId },
    })
  }

  async createPaymentIntent(
    amountCents: number,
    currency: string,
    metadata: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount: amountCents,
      currency,
      metadata,
    })
  }

  verifyWebhookSignature(payload: string, signature: string, secret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret)
  }
}
