export declare const getJob: import("convex/server").RegisteredQuery<"public", {
    id: import("convex/values").GenericId<"jobs">;
}, Promise<{
    _id: import("convex/values").GenericId<"jobs">;
    _creationTime: number;
    step?: string | undefined;
    startedAt?: number | undefined;
    finishedAt?: number | undefined;
    error?: string | undefined;
    type: "preview" | "create" | "upgrade" | "redeploy" | "attach_domain" | "release" | "convert" | "campaign_send";
    projectId: import("convex/values").GenericId<"projects">;
    state: "queued" | "running" | "failed" | "done";
} | null>>;
export declare const getJobLogs: import("convex/server").RegisteredQuery<"public", {
    jobId: import("convex/values").GenericId<"jobs">;
}, Promise<{
    _id: import("convex/values").GenericId<"job_logs">;
    _creationTime: number;
    jobId: import("convex/values").GenericId<"jobs">;
    timestamp: number;
    level: "error" | "info" | "warn";
    message: string;
}[]>>;
export declare const createJob: import("convex/server").RegisteredMutation<"public", {
    type: "create" | "upgrade" | "redeploy" | "attach_domain" | "release";
    projectId: import("convex/values").GenericId<"projects">;
}, Promise<import("convex/values").GenericId<"jobs">>>;
export declare const updateJob: import("convex/server").RegisteredMutation<"public", {
    state?: "queued" | "running" | "failed" | "done" | undefined;
    step?: string | undefined;
    error?: string | undefined;
    id: import("convex/values").GenericId<"jobs">;
}, Promise<void>>;
export declare const appendJobLog: import("convex/server").RegisteredMutation<"public", {
    jobId: import("convex/values").GenericId<"jobs">;
    level: "error" | "info" | "warn";
    message: string;
}, Promise<import("convex/values").GenericId<"job_logs">>>;
export declare const listByProject: import("convex/server").RegisteredQuery<"public", {
    projectId: import("convex/values").GenericId<"projects">;
}, Promise<{
    _id: import("convex/values").GenericId<"jobs">;
    _creationTime: number;
    step?: string | undefined;
    startedAt?: number | undefined;
    finishedAt?: number | undefined;
    error?: string | undefined;
    type: "preview" | "create" | "upgrade" | "redeploy" | "attach_domain" | "release" | "convert" | "campaign_send";
    projectId: import("convex/values").GenericId<"projects">;
    state: "queued" | "running" | "failed" | "done";
}[]>>;
//# sourceMappingURL=jobs.d.ts.map