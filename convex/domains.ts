import { query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"

export const listDomains = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
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
