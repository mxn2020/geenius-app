export declare const listDomains: import("convex/server").RegisteredQuery<"public", {
    projectId: import("convex/values").GenericId<"projects">;
}, Promise<{
    _id: import("convex/values").GenericId<"domains">;
    _creationTime: number;
    registrarDomainId?: string | undefined;
    renewalDate?: number | undefined;
    status: "failed" | "purchased" | "configuring" | "verifying" | "active";
    projectId: import("convex/values").GenericId<"projects">;
    domainName: string;
    registrar: string;
    purchasePriceCents: number;
    renewalPriceCents: number;
}[]>>;
export declare const createDomain: import("convex/server").RegisteredMutation<"public", {
    projectId: import("convex/values").GenericId<"projects">;
    domainName: string;
    purchasePriceCents: number;
    renewalPriceCents: number;
}, Promise<import("convex/values").GenericId<"domains">>>;
export declare const updateDomainStatus: import("convex/server").RegisteredMutation<"internal", {
    id: import("convex/values").GenericId<"domains">;
    status: "failed" | "purchased" | "configuring" | "verifying" | "active";
}, Promise<void>>;
//# sourceMappingURL=domains.d.ts.map