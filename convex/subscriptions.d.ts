export declare const getByProject: import("convex/server").RegisteredQuery<"public", {
    projectId: string;
}, Promise<{
    _id: import("convex/values").GenericId<"subscriptions">;
    _creationTime: number;
    graceUntil?: number | undefined;
    status: string;
    projectId: import("convex/values").GenericId<"projects">;
    stripeSubscriptionId: string;
    stripePriceId: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
} | null>>;
export declare const getByStripeSubscriptionId: import("convex/server").RegisteredQuery<"public", {
    stripeSubscriptionId: string;
}, Promise<{
    _id: import("convex/values").GenericId<"subscriptions">;
    _creationTime: number;
    graceUntil?: number | undefined;
    status: string;
    projectId: import("convex/values").GenericId<"projects">;
    stripeSubscriptionId: string;
    stripePriceId: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
} | null>>;
export declare const upsert: import("convex/server").RegisteredMutation<"public", {
    status: string;
    projectId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    currentPeriodStart: number;
    currentPeriodEnd: number;
}, Promise<import("convex/values").GenericId<"subscriptions">>>;
export declare const setGracePeriod: import("convex/server").RegisteredMutation<"public", {
    stripeSubscriptionId: string;
    graceUntil: number;
}, Promise<void>>;
export declare const cancelByStripeSubscriptionId: import("convex/server").RegisteredMutation<"public", {
    stripeSubscriptionId: string;
}, Promise<import("convex/values").GenericId<"projects"> | null>>;
//# sourceMappingURL=subscriptions.d.ts.map