export declare const list: import("convex/server").RegisteredQuery<"public", {}, Promise<{
    _id: import("convex/values").GenericId<"campaigns">;
    _creationTime: number;
    complianceAcknowledged?: boolean | undefined;
    totalProspects?: number | undefined;
    totalSent?: number | undefined;
    totalOpened?: number | undefined;
    totalReplied?: number | undefined;
    name: string;
    createdAt: number;
    resellerId: import("convex/values").GenericId<"users">;
    status: "active" | "draft" | "paused" | "completed";
    location: string;
    niche: string;
    complianceMarket: "EU" | "US" | "UK" | "DACH";
    templateSubject: string;
    templateBody: string;
}[]>>;
export declare const get: import("convex/server").RegisteredQuery<"public", {
    id: import("convex/values").GenericId<"campaigns">;
}, Promise<{
    _id: import("convex/values").GenericId<"campaigns">;
    _creationTime: number;
    complianceAcknowledged?: boolean | undefined;
    totalProspects?: number | undefined;
    totalSent?: number | undefined;
    totalOpened?: number | undefined;
    totalReplied?: number | undefined;
    name: string;
    createdAt: number;
    resellerId: import("convex/values").GenericId<"users">;
    status: "active" | "draft" | "paused" | "completed";
    location: string;
    niche: string;
    complianceMarket: "EU" | "US" | "UK" | "DACH";
    templateSubject: string;
    templateBody: string;
} | null>>;
export declare const getEmails: import("convex/server").RegisteredQuery<"public", {
    campaignId: import("convex/values").GenericId<"campaigns">;
}, Promise<{
    _id: import("convex/values").GenericId<"campaign_emails">;
    _creationTime: number;
    sentAt?: number | undefined;
    openedAt?: number | undefined;
    repliedAt?: number | undefined;
    resendMessageId?: string | undefined;
    prospectId: import("convex/values").GenericId<"prospects">;
    status: "queued" | "failed" | "sent" | "opened" | "replied" | "bounced";
    campaignId: import("convex/values").GenericId<"campaigns">;
}[]>>;
export declare const create: import("convex/server").RegisteredMutation<"public", {
    name: string;
    location: string;
    niche: string;
    complianceMarket: "EU" | "US" | "UK" | "DACH";
    templateSubject: string;
    templateBody: string;
}, Promise<import("convex/values").GenericId<"campaigns">>>;
export declare const update: import("convex/server").RegisteredMutation<"public", {
    name?: string | undefined;
    complianceAcknowledged?: boolean | undefined;
    templateSubject?: string | undefined;
    templateBody?: string | undefined;
    id: import("convex/values").GenericId<"campaigns">;
}, Promise<void>>;
export declare const activate: import("convex/server").RegisteredMutation<"public", {
    id: import("convex/values").GenericId<"campaigns">;
}, Promise<void>>;
export declare const pause: import("convex/server").RegisteredMutation<"public", {
    id: import("convex/values").GenericId<"campaigns">;
}, Promise<void>>;
export declare const updateEmailStatus: import("convex/server").RegisteredMutation<"public", {
    resendMessageId?: string | undefined;
    status: "failed" | "sent" | "opened" | "replied" | "bounced";
    emailId: import("convex/values").GenericId<"campaign_emails">;
}, Promise<void>>;
//# sourceMappingURL=campaigns.d.ts.map