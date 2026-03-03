export declare const getCurrentAllowance: import("convex/server").RegisteredQuery<"public", {
    projectId: import("convex/values").GenericId<"projects">;
}, Promise<{
    _id: import("convex/values").GenericId<"ai_allowance_periods">;
    _creationTime: number;
    projectId: import("convex/values").GenericId<"projects">;
    periodStart: number;
    periodEnd: number;
    creditsGranted: number;
    creditsUsed: number;
} | null>>;
export declare const getAIUsage: import("convex/server").RegisteredQuery<"public", {
    projectId: import("convex/values").GenericId<"projects">;
}, Promise<number>>;
export declare const deductCredits: import("convex/server").RegisteredMutation<"public", {
    projectId: import("convex/values").GenericId<"projects">;
    model: string;
    credits: number;
    requestId: string;
}, Promise<{
    ok: boolean;
    alreadyProcessed: boolean;
}>>;
export declare const resetAllowancePeriod: import("convex/server").RegisteredMutation<"public", {
    projectId: import("convex/values").GenericId<"projects">;
    periodStart: number;
    periodEnd: number;
    creditsGranted: number;
}, Promise<import("convex/values").GenericId<"ai_allowance_periods">>>;
//# sourceMappingURL=ai.d.ts.map