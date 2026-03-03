export declare const list: import("convex/server").RegisteredQuery<"public", {
    status?: "new" | "contacted" | "negotiating" | "won" | "lost" | undefined;
    niche?: string | undefined;
}, Promise<{
    _id: import("convex/values").GenericId<"prospects">;
    _creationTime: number;
    email?: string | undefined;
    website?: string | undefined;
    contactName?: string | undefined;
    phone?: string | undefined;
    previewProjectId?: import("convex/values").GenericId<"projects"> | undefined;
    aiSummary?: string | undefined;
    createdAt: number;
    resellerId: import("convex/values").GenericId<"users">;
    status: "new" | "contacted" | "negotiating" | "won" | "lost";
    businessName: string;
    location: string;
    niche: string;
}[]>>;
export declare const getWithConversations: import("convex/server").RegisteredQuery<"public", {
    id: import("convex/values").GenericId<"prospects">;
}, Promise<{
    conversations: {
        _id: import("convex/values").GenericId<"prospect_conversations">;
        _creationTime: number;
        resendMessageId?: string | undefined;
        subject?: string | undefined;
        prospectId: import("convex/values").GenericId<"prospects">;
        timestamp: number;
        direction: "inbound" | "outbound";
        body: string;
    }[];
    _id: import("convex/values").GenericId<"prospects">;
    _creationTime: number;
    email?: string | undefined;
    website?: string | undefined;
    contactName?: string | undefined;
    phone?: string | undefined;
    previewProjectId?: import("convex/values").GenericId<"projects"> | undefined;
    aiSummary?: string | undefined;
    createdAt: number;
    resellerId: import("convex/values").GenericId<"users">;
    status: "new" | "contacted" | "negotiating" | "won" | "lost";
    businessName: string;
    location: string;
    niche: string;
} | null>>;
export declare const create: import("convex/server").RegisteredMutation<"public", {
    email?: string | undefined;
    website?: string | undefined;
    contactName?: string | undefined;
    phone?: string | undefined;
    aiSummary?: string | undefined;
    businessName: string;
    location: string;
    niche: string;
}, Promise<import("convex/values").GenericId<"prospects">>>;
export declare const bulkCreate: import("convex/server").RegisteredMutation<"public", {
    prospects: {
        email?: string | undefined;
        website?: string | undefined;
        contactName?: string | undefined;
        phone?: string | undefined;
        aiSummary?: string | undefined;
        businessName: string;
        location: string;
        niche: string;
    }[];
}, Promise<import("convex/values").GenericId<"prospects">[]>>;
export declare const updateStatus: import("convex/server").RegisteredMutation<"public", {
    id: import("convex/values").GenericId<"prospects">;
    status: "new" | "contacted" | "negotiating" | "won" | "lost";
}, Promise<void>>;
export declare const linkPreview: import("convex/server").RegisteredMutation<"public", {
    id: import("convex/values").GenericId<"prospects">;
    previewProjectId: import("convex/values").GenericId<"projects">;
}, Promise<void>>;
//# sourceMappingURL=prospects.d.ts.map