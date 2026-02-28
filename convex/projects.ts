import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) return []
    return ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.neq(q.field("status"), "deleted"))
      .collect()
  },
})

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()
  },
})

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    plan: v.union(v.literal("website"), v.literal("webapp"), v.literal("authdb"), v.literal("ai")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()
    if (existing) throw new Error("Slug already taken")
    return ctx.db.insert("projects", {
      ...args,
      status: "creating",
      createdAt: Date.now(),
    })
  },
})

export const updateStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(v.literal("creating"), v.literal("live"), v.literal("suspended"), v.literal("deleted")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, { status: args.status })
  },
})
