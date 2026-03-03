export declare const getMe: import("convex/server").RegisteredQuery<"public", {}, Promise<{
    _id: import("convex/values").GenericId<"users">;
    _creationTime: number;
    name?: string | undefined;
    email?: string | undefined;
    image?: string | undefined;
    convexUserId?: string | undefined;
    stripeCustomerId?: string | undefined;
    role?: "superAdmin" | "user" | "reseller" | undefined;
    createdAt?: number | undefined;
} | null>>;
export declare const ensureUser: import("convex/server").RegisteredMutation<"public", {}, Promise<import("convex/values").GenericId<"users">>>;
export declare const promoteToAdmin: import("convex/server").RegisteredMutation<"public", {
    email: string;
}, Promise<string>>;
export declare const setRole: import("convex/server").RegisteredMutation<"public", {
    email: string;
    role: "superAdmin" | "user" | "reseller";
}, Promise<string>>;
//# sourceMappingURL=users.d.ts.map