import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"


export const getCurrentAllowance = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) return null

    // Verify ownership (superAdmins can see any)
    if (user.role !== "superAdmin") {
      const project = await ctx.db.get(args.projectId)
      if (!project || project.userId !== user._id) return null
    }

    const now = Date.now()
    return ctx.db
      .query("ai_allowance_periods")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) =>
        q.and(
          q.lte(q.field("periodStart"), now),
          q.gte(q.field("periodEnd"), now)
        )
      )
      .first()
  },
})

export const getAIUsage = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return 0
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) return 0

    // Verify ownership (superAdmins can see any)
    if (user.role !== "superAdmin") {
      const project = await ctx.db.get(args.projectId)
      if (!project || project.userId !== user._id) return 0
    }

    const now = Date.now()
    const period = await ctx.db
      .query("ai_allowance_periods")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) =>
        q.and(
          q.lte(q.field("periodStart"), now),
          q.gte(q.field("periodEnd"), now)
        )
      )
      .first()
    if (!period) return 0
    return period.creditsUsed
  },
})

export const deductCredits = mutation({
  args: {
    projectId: v.id("projects"),
    credits: v.number(),
    model: v.string(),
    requestId: v.string(),
  },
  handler: async (ctx, args) => {
    // Idempotency: skip if request already processed
    const existing = await ctx.db
      .query("ai_usage_events")
      .withIndex("by_request_id", (q) => q.eq("requestId", args.requestId))
      .unique()
    if (existing) return { ok: true, alreadyProcessed: true }

    const now = Date.now()
    const period = await ctx.db
      .query("ai_allowance_periods")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) =>
        q.and(
          q.lte(q.field("periodStart"), now),
          q.gte(q.field("periodEnd"), now)
        )
      )
      .first()

    if (!period) throw new Error("No active allowance period")
    if (period.creditsUsed + args.credits > period.creditsGranted) {
      throw new Error("Insufficient credits")
    }

    await ctx.db.patch(period._id, {
      creditsUsed: period.creditsUsed + args.credits,
    })

    await ctx.db.insert("ai_usage_events", {
      projectId: args.projectId,
      timestamp: now,
      model: args.model,
      credits: args.credits,
      requestId: args.requestId,
    })

    return { ok: true, alreadyProcessed: false }
  },
})

export const resetAllowancePeriod = mutation({
  args: {
    projectId: v.id("projects"),
    periodStart: v.number(),
    periodEnd: v.number(),
    creditsGranted: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("ai_allowance_periods", {
      projectId: args.projectId,
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      creditsGranted: args.creditsGranted,
      creditsUsed: 0,
    })
  },
})

// ─── Worker-callable: no auth (called from runtime proxy via server) ────

/** Get current allowance for a project — no auth (used by AI proxy runtime) */
export const workerGetCurrentAllowance = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const now = Date.now()
    return ctx.db
      .query("ai_allowance_periods")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) =>
        q.and(
          q.lte(q.field("periodStart"), now),
          q.gte(q.field("periodEnd"), now)
        )
      )
      .first()
  },
})
