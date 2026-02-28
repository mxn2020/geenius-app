import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getByProject = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    // projectId may be passed as string from external HTTP client
    return ctx.db
      .query("subscriptions")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .first()
  },
})

export const getByStripeSubscriptionId = query({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_sub", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first()
  },
})

export const upsert = mutation({
  args: {
    projectId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_sub", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first()

    const data = {
      stripePriceId: args.stripePriceId,
      status: args.status,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
    }

    if (existing) {
      await ctx.db.patch(existing._id, data)
      return existing._id
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ctx.db.insert("subscriptions", { projectId: args.projectId as any, ...data, stripeSubscriptionId: args.stripeSubscriptionId })
  },
})

export const setGracePeriod = mutation({
  args: {
    stripeSubscriptionId: v.string(),
    graceUntil: v.number(),
  },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_sub", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first()
    if (!sub) return
    await ctx.db.patch(sub._id, { graceUntil: args.graceUntil, status: "past_due" })
  },
})

export const cancelByStripeSubscriptionId = mutation({
  args: { stripeSubscriptionId: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_sub", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .first()
    if (!sub) return null
    await ctx.db.patch(sub._id, { status: "canceled" })
    return sub.projectId
  },
})
