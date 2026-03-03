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
    args: {
        status: v.optional(v.union(
            v.literal("new"), v.literal("contacted"),
            v.literal("negotiating"), v.literal("won"), v.literal("lost")
        )),
        niche: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) return []

        if (args.status) {
            return ctx.db
                .query("prospects")
                .withIndex("by_status", (q) =>
                    q.eq("resellerId", user._id).eq("status", args.status!)
                )
                .collect()
        }
        return ctx.db
            .query("prospects")
            .withIndex("by_reseller", (q) => q.eq("resellerId", user._id))
            .collect()
    },
})

export const getWithConversations = query({
    args: { id: v.id("prospects") },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) return null
        const prospect = await ctx.db.get(args.id)
        if (!prospect || prospect.resellerId !== user._id) return null
        const conversations = await ctx.db
            .query("prospect_conversations")
            .withIndex("by_prospect", (q) => q.eq("prospectId", args.id))
            .collect()
        return { ...prospect, conversations }
    },
})

// ─── Mutations ───────────────────────────────────────
export const create = mutation({
    args: {
        businessName: v.string(),
        contactName: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        location: v.string(),
        niche: v.string(),
        aiSummary: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) throw new Error("Not a reseller")
        return ctx.db.insert("prospects", {
            resellerId: user._id,
            ...args,
            status: "new",
            createdAt: Date.now(),
        })
    },
})

export const bulkCreate = mutation({
    args: {
        prospects: v.array(v.object({
            businessName: v.string(),
            contactName: v.optional(v.string()),
            email: v.optional(v.string()),
            phone: v.optional(v.string()),
            website: v.optional(v.string()),
            location: v.string(),
            niche: v.string(),
            aiSummary: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) throw new Error("Not a reseller")
        const ids = []
        for (const p of args.prospects) {
            const id = await ctx.db.insert("prospects", {
                resellerId: user._id,
                ...p,
                status: "new",
                createdAt: Date.now(),
            })
            ids.push(id)
        }
        return ids
    },
})

export const updateStatus = mutation({
    args: {
        id: v.id("prospects"),
        status: v.union(
            v.literal("new"), v.literal("contacted"),
            v.literal("negotiating"), v.literal("won"), v.literal("lost")
        ),
    },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) throw new Error("Not a reseller")
        const prospect = await ctx.db.get(args.id)
        if (!prospect || prospect.resellerId !== user._id)
            throw new Error("Prospect not found")
        await ctx.db.patch(args.id, { status: args.status })
    },
})

export const linkPreview = mutation({
    args: {
        id: v.id("prospects"),
        previewProjectId: v.id("projects"),
    },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) throw new Error("Not a reseller")
        await ctx.db.patch(args.id, { previewProjectId: args.previewProjectId })
    },
})
