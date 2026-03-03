import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
export const getMe = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId)
            return null;
        return ctx.db
            .query("users")
            .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
            .unique();
    },
});
export const ensureUser = mutation({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId)
            throw new Error("Not authenticated");
        const existing = await ctx.db
            .query("users")
            .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
            .unique();
        if (existing)
            return existing._id;
        return ctx.db.insert("users", {
            convexUserId: userId,
            createdAt: Date.now(),
        });
    },
});
export const promoteToAdmin = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        // 1. Find the Auth Account by email
        const account = await ctx.db
            .query("authAccounts")
            .filter((q) => q.eq(q.field("providerAccountId"), args.email))
            .unique();
        if (!account) {
            throw new Error(`Auth account for ${args.email} not found`);
        }
        // 2. We can't rely on account.userId matching users._id or convexUserId directly due to Auth framework magic.
        // Let's just grab all users and find the one that matches this account's userId in *either* field.
        const allUsers = await ctx.db.query("users").collect();
        const user = allUsers.find(u => u.convexUserId === account.userId || u._id === account.userId);
        if (!user) {
            throw new Error(`User document for auth account ${account.userId} not found directly. Users found: ${allUsers.length}`);
        }
        // 3. Patch the role
        await ctx.db.patch(user._id, { role: "superAdmin" });
        return `Successfully promoted ${args.email} to superAdmin.`;
    },
});
export const setRole = mutation({
    args: {
        email: v.string(),
        role: v.union(v.literal("superAdmin"), v.literal("user"), v.literal("reseller"))
    },
    handler: async (ctx, args) => {
        const account = await ctx.db
            .query("authAccounts")
            .filter((q) => q.eq(q.field("providerAccountId"), args.email))
            .unique();
        if (!account)
            throw new Error(`Auth account for ${args.email} not found`);
        const allUsers = await ctx.db.query("users").collect();
        const user = allUsers.find(u => u.convexUserId === account.userId || u._id === account.userId);
        if (!user)
            throw new Error(`User document for auth account not found`);
        await ctx.db.patch(user._id, { role: args.role });
        return `Successfully set ${args.email} to ${args.role}.`;
    },
});
//# sourceMappingURL=users.js.map