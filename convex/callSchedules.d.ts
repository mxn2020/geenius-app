export declare const list: import("convex/server").RegisteredQuery<"public", {}, Promise<{
    _id: import("convex/values").GenericId<"call_schedules">;
    _creationTime: number;
    meetingUrl?: string | undefined;
    notes?: string | undefined;
    createdAt: number;
    resellerId: import("convex/values").GenericId<"users">;
    prospectId: import("convex/values").GenericId<"prospects">;
    status: "completed" | "scheduled" | "cancelled" | "no_show";
    scheduledAt: number;
}[]>>;
export declare const getByProspect: import("convex/server").RegisteredQuery<"public", {
    prospectId: import("convex/values").GenericId<"prospects">;
}, Promise<{
    _id: import("convex/values").GenericId<"call_schedules">;
    _creationTime: number;
    meetingUrl?: string | undefined;
    notes?: string | undefined;
    createdAt: number;
    resellerId: import("convex/values").GenericId<"users">;
    prospectId: import("convex/values").GenericId<"prospects">;
    status: "completed" | "scheduled" | "cancelled" | "no_show";
    scheduledAt: number;
}[]>>;
export declare const create: import("convex/server").RegisteredMutation<"public", {
    meetingUrl?: string | undefined;
    notes?: string | undefined;
    prospectId: import("convex/values").GenericId<"prospects">;
    scheduledAt: number;
}, Promise<import("convex/values").GenericId<"call_schedules">>>;
export declare const cancel: import("convex/server").RegisteredMutation<"public", {
    id: import("convex/values").GenericId<"call_schedules">;
}, Promise<void>>;
export declare const complete: import("convex/server").RegisteredMutation<"public", {
    notes?: string | undefined;
    id: import("convex/values").GenericId<"call_schedules">;
}, Promise<void>>;
//# sourceMappingURL=callSchedules.d.ts.map