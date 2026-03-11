import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// ─── Queries ─────────────────────────────────────────

export const getByProject = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return ctx.db
            .query("project_settings")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique()
    },
})

// ─── Mutations ───────────────────────────────────────

export const upsert = mutation({
    args: {
        projectId: v.id("projects"),
        aiModel: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("project_settings")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .unique()

        const patch: Record<string, unknown> = { updatedAt: Date.now() }
        if (args.aiModel !== undefined) patch.aiModel = args.aiModel

        if (existing) {
            await ctx.db.patch(existing._id, patch)
            return existing._id
        }

        return ctx.db.insert("project_settings", {
            projectId: args.projectId,
            aiModel: args.aiModel,
            updatedAt: Date.now(),
        })
    },
})
