import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    return ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
  },
})

export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) throw new Error("Not authenticated")
    const existing = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (existing) return existing._id
    return ctx.db.insert("users", {
      convexUserId: userId,
      createdAt: Date.now(),
    })
  },
})
