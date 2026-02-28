import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

export const getProject = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) return null
    const project = await ctx.db.get(args.id)
    if (!project || project.userId !== user._id) return null
    return project
  },
})

export const listProjects = query({
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

export const createProject = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    plan: v.union(v.literal("website"), v.literal("webapp"), v.literal("authdb"), v.literal("ai")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) throw new Error("User not found")
    const existing = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique()
    if (existing) throw new Error("Slug already taken")
    return ctx.db.insert("projects", {
      userId: user._id,
      name: args.name,
      slug: args.slug,
      plan: args.plan,
      status: "creating",
      createdAt: Date.now(),
    })
  },
})

export const updateProjectStatus = mutation({
  args: {
    id: v.id("projects"),
    status: v.union(v.literal("creating"), v.literal("live"), v.literal("suspended"), v.literal("deleted")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status })
  },
})

export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    vercelProjectId: v.optional(v.string()),
    githubRepoId: v.optional(v.string()),
    primaryUrl: v.optional(v.string()),
    status: v.optional(v.union(v.literal("creating"), v.literal("live"), v.literal("suspended"), v.literal("deleted"))),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args
    const patch: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) patch[k] = v
    }
    await ctx.db.patch(id, patch)
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
