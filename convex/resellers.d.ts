export declare const getProfile: import("convex/server").RegisteredQuery<"public", {}, Promise<{
    _id: import("convex/values").GenericId<"reseller_profiles">;
    _creationTime: number;
    logoUrl?: string | undefined;
    primaryColor?: string | undefined;
    customDomain?: string | undefined;
    resendApiKey?: string | undefined;
    stripeConnectAccountId?: string | undefined;
    emailFromName?: string | undefined;
    emailFromDomain?: string | undefined;
    onboardingComplete?: boolean | undefined;
    createdAt: number;
    userId: import("convex/values").GenericId<"users">;
    companyName: string;
} | null>>;
export declare const listResellers: import("convex/server").RegisteredQuery<"public", {}, Promise<{
    _id: import("convex/values").GenericId<"reseller_profiles">;
    _creationTime: number;
    logoUrl?: string | undefined;
    primaryColor?: string | undefined;
    customDomain?: string | undefined;
    resendApiKey?: string | undefined;
    stripeConnectAccountId?: string | undefined;
    emailFromName?: string | undefined;
    emailFromDomain?: string | undefined;
    onboardingComplete?: boolean | undefined;
    createdAt: number;
    userId: import("convex/values").GenericId<"users">;
    companyName: string;
}[]>>;
export declare const getUsageStats: import("convex/server").RegisteredQuery<"public", {
    month?: string | undefined;
}, Promise<{
    _id: import("convex/values").GenericId<"reseller_usage">;
    _creationTime: number;
    revenueCollectedCents?: number | undefined;
    platformFeeCents?: number | undefined;
    resellerId: import("convex/values").GenericId<"users">;
    month: string;
    deployedProjects: number;
    emailsSent: number;
    aiCreditsUsed: number;
} | null>>;
export declare const upsertProfile: import("convex/server").RegisteredMutation<"public", {
    logoUrl?: string | undefined;
    primaryColor?: string | undefined;
    customDomain?: string | undefined;
    resendApiKey?: string | undefined;
    stripeConnectAccountId?: string | undefined;
    emailFromName?: string | undefined;
    emailFromDomain?: string | undefined;
    companyName: string;
}, Promise<import("convex/values").GenericId<"reseller_profiles">>>;
//# sourceMappingURL=resellers.d.ts.map