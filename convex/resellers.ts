import { query, mutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

// ─── Helpers ─────────────────────────────────────────
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
export const getProfile = query({
    args: {},
    handler: async (ctx) => {
        const user = await getResellerUser(ctx)
        if (!user) return null
        return ctx.db
            .query("reseller_profiles")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .unique()
    },
})

export const listResellers = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx)
        if (!userId) return []
        const user = await ctx.db
            .query("users")
            .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
            .unique()
        if (!user || user.role !== "superAdmin") return []
        const profiles = await ctx.db.query("reseller_profiles").collect()
        return profiles
    },
})

export const getUsageStats = query({
    args: { month: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) return null
        const month = args.month ?? new Date().toISOString().slice(0, 7)
        return ctx.db
            .query("reseller_usage")
            .withIndex("by_month", (q) => q.eq("resellerId", user._id).eq("month", month))
            .unique()
    },
})

// ─── Mutations ───────────────────────────────────────
export const upsertProfile = mutation({
    args: {
        companyName: v.string(),
        logoUrl: v.optional(v.string()),
        primaryColor: v.optional(v.string()),
        customDomain: v.optional(v.string()),
        resendApiKey: v.optional(v.string()),
        stripeConnectAccountId: v.optional(v.string()),
        emailFromName: v.optional(v.string()),
        emailFromDomain: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx)
        if (!user) throw new Error("Not a reseller")

        const existing = await ctx.db
            .query("reseller_profiles")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .unique()

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args,
                onboardingComplete: !!(args.companyName && args.resendApiKey && args.stripeConnectAccountId),
            })
            return existing._id
        }

        return ctx.db.insert("reseller_profiles", {
            userId: user._id,
            ...args,
            onboardingComplete: !!(args.companyName && args.resendApiKey && args.stripeConnectAccountId),
            createdAt: Date.now(),
        })
    },
})
