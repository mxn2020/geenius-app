import { query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

export const listDomains = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) return []

    // Verify ownership (superAdmins can see any)
    if (user.role !== "superAdmin") {
      const project = await ctx.db.get(args.projectId)
      if (!project || project.userId !== user._id) return []
    }

    return ctx.db
      .query("domains")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()
  },
})

export const createDomain = mutation({
  args: {
    projectId: v.id("projects"),
    domainName: v.string(),
    purchasePriceCents: v.number(),
    renewalPriceCents: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("domains", {
      projectId: args.projectId,
      domainName: args.domainName,
      registrar: "namecheap",
      status: "purchased",
      purchasePriceCents: args.purchasePriceCents,
      renewalPriceCents: args.renewalPriceCents,
    })
  },
})

export const updateDomainStatus = internalMutation({
  args: {
    id: v.id("domains"),
    status: v.union(
      v.literal("purchased"),
      v.literal("configuring"),
      v.literal("verifying"),
      v.literal("active"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status })
  },
})

// ─── Worker-callable functions (no auth — called via ConvexHttpClient) ────

/** Update domain status by projectId + domainName (worker) */
export const workerUpdateDomainStatus = mutation({
  args: {
    projectId: v.id("projects"),
    domainName: v.string(),
    status: v.union(
      v.literal("purchased"),
      v.literal("configuring"),
      v.literal("verifying"),
      v.literal("active"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const domain = await ctx.db
      .query("domains")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("domainName"), args.domainName))
      .unique()
    if (!domain) throw new Error(`Domain ${args.domainName} not found for project`)
    await ctx.db.patch(domain._id, { status: args.status })
  },
})


// ─── Renewal Cron Support ────────────────────────────

/** List domains expiring before a given timestamp */
export const listExpiring = query({
  args: { beforeTimestamp: v.number() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("domains").collect()
    return all.filter(
      (d) =>
        d.status === "active" &&
        d.renewalDate !== undefined &&
        d.renewalDate <= args.beforeTimestamp
    )
  },
})

/** Update domain renewal date after successful renewal */
export const updateDomainRenewal = mutation({
  args: {
    id: v.id("domains"),
    renewalDate: v.number(),
    renewalPriceCents: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      renewalDate: args.renewalDate,
      renewalPriceCents: args.renewalPriceCents,
    })
  },
})
