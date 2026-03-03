export declare const getRulesForMarket: import("convex/server").RegisteredQuery<"public", {
    market: "EU" | "US" | "UK" | "DACH";
}, Promise<{
    _id: import("convex/values").GenericId<"compliance_rules">;
    _creationTime: number;
    updatedAt: number;
    market: "EU" | "US" | "UK" | "DACH";
    ruleName: string;
    description: string;
    severity: "info" | "warning" | "critical";
}[]>>;
export declare const seedRules: import("convex/server").RegisteredMutation<"public", {}, Promise<string>>;
//# sourceMappingURL=compliance.d.ts.map