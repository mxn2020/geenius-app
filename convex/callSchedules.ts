import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

async function getResellerUser(ctx: any) {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const user = await ctx.db
        .query("users")
        .withIndex("by_convex_user", (q: any) => q.eq("convexUserId", userId))
        .unique()
    if (!user || user.role !== "reseller") return null
    return user
}

// ─── Queries ─────────────────────────────────────────
export const list = query({
    args: {},
    handler: async (ctx) => {
        const user = await getResellerUser(ctx)
        if (!user) return []
        return ctx.db
            .query("call_schedules")
            .withIndex("by_reseller", (q) => q.eq("resellerId", user._id))
            .collect()
    },
})

export const getByProspect = query({
    args: { prospectId: v.id("prospects") },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) return []
        return ctx.db
            .query("call_schedules")
            .withIndex("by_prospect", (q) => q.eq("prospectId", args.prospectId))
            .collect()
    },
})

// ─── Mutations ───────────────────────────────────────
export const create = mutation({
    args: {
        prospectId: v.id("prospects"),
        scheduledAt: v.number(),
        meetingUrl: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) throw new Error("Not a reseller")
        return ctx.db.insert("call_schedules", {
            prospectId: args.prospectId,
            resellerId: user._id,
            scheduledAt: args.scheduledAt,
            status: "scheduled",
            meetingUrl: args.meetingUrl,
            notes: args.notes,
            createdAt: Date.now(),
        })
    },
})

export const cancel = mutation({
    args: { id: v.id("call_schedules") },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) throw new Error("Not a reseller")
        await ctx.db.patch(args.id, { status: "cancelled" })
    },
})

export const complete = mutation({
    args: {
        id: v.id("call_schedules"),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) throw new Error("Not a reseller")
        const patch: Record<string, unknown> = { status: "completed" }
        if (args.notes) patch.notes = args.notes
        await ctx.db.patch(args.id, patch)
    },
})
