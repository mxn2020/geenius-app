import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
async function getResellerUser(ctx) {
    const userId = await getAuthUserId(ctx);
    if (!userId)
        return null;
    const user = await ctx.db
        .query("users")
        .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
        .unique();
    if (!user || user.role !== "reseller")
        return null;
    return user;
}
// ─── Queries ─────────────────────────────────────────
export const list = query({
    args: {},
    handler: async (ctx) => {
        const user = await getResellerUser(ctx);
        if (!user)
            return [];
        return ctx.db
            .query("campaigns")
            .withIndex("by_reseller", (q) => q.eq("resellerId", user._id))
            .collect();
    },
});
export const get = query({
    args: { id: v.id("campaigns") },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx);
        if (!user)
            return null;
        const campaign = await ctx.db.get(args.id);
        if (!campaign || campaign.resellerId !== user._id)
            return null;
        return campaign;
    },
});
export const getEmails = query({
    args: { campaignId: v.id("campaigns") },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx);
        if (!user)
            return [];
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign || campaign.resellerId !== user._id)
            return [];
        return ctx.db
            .query("campaign_emails")
            .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
            .collect();
    },
});
// ─── Mutations ───────────────────────────────────────
export const create = mutation({
    args: {
        name: v.string(),
        niche: v.string(),
        location: v.string(),
        complianceMarket: v.union(v.literal("EU"), v.literal("US"), v.literal("UK"), v.literal("DACH")),
        templateSubject: v.string(),
        templateBody: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx);
        if (!user)
            throw new Error("Not a reseller");
        return ctx.db.insert("campaigns", {
            resellerId: user._id,
            ...args,
            status: "draft",
            complianceAcknowledged: false,
            totalProspects: 0,
            totalSent: 0,
            totalOpened: 0,
            totalReplied: 0,
            createdAt: Date.now(),
        });
    },
});
export const update = mutation({
    args: {
        id: v.id("campaigns"),
        name: v.optional(v.string()),
        templateSubject: v.optional(v.string()),
        templateBody: v.optional(v.string()),
        complianceAcknowledged: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx);
        if (!user)
            throw new Error("Not a reseller");
        const { id, ...fields } = args;
        const patch = {};
        for (const [k, val] of Object.entries(fields)) {
            if (val !== undefined)
                patch[k] = val;
        }
        await ctx.db.patch(id, patch);
    },
});
export const activate = mutation({
    args: { id: v.id("campaigns") },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx);
        if (!user)
            throw new Error("Not a reseller");
        const campaign = await ctx.db.get(args.id);
        if (!campaign || campaign.resellerId !== user._id)
            throw new Error("Campaign not found");
        if (!campaign.complianceAcknowledged)
            throw new Error("You must acknowledge compliance rules before activating");
        if (campaign.status !== "draft" && campaign.status !== "paused")
            throw new Error("Campaign must be in draft or paused state to activate");
        await ctx.db.patch(args.id, { status: "active" });
    },
});
export const pause = mutation({
    args: { id: v.id("campaigns") },
    handler: async (ctx, args) => {
        const user = await getResellerUser(ctx);
        if (!user)
            throw new Error("Not a reseller");
        await ctx.db.patch(args.id, { status: "paused" });
    },
});
export const updateEmailStatus = mutation({
    args: {
        emailId: v.id("campaign_emails"),
        status: v.union(v.literal("sent"), v.literal("opened"), v.literal("replied"), v.literal("bounced"), v.literal("failed")),
        resendMessageId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const patch = { status: args.status };
        if (args.resendMessageId)
            patch.resendMessageId = args.resendMessageId;
        if (args.status === "sent")
            patch.sentAt = Date.now();
        if (args.status === "opened")
            patch.openedAt = Date.now();
        if (args.status === "replied")
            patch.repliedAt = Date.now();
        await ctx.db.patch(args.emailId, patch);
    },
});
//# sourceMappingURL=campaigns.js.map