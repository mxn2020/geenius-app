export declare const getProject: import("convex/server").RegisteredQuery<"public", {
    id: import("convex/values").GenericId<"projects">;
}, Promise<{
    _id: import("convex/values").GenericId<"projects">;
    _creationTime: number;
    resellerId?: import("convex/values").GenericId<"users"> | undefined;
    prospectId?: import("convex/values").GenericId<"prospects"> | undefined;
    prompt?: string | undefined;
    vercelProjectId?: string | undefined;
    githubRepoId?: string | undefined;
    primaryUrl?: string | undefined;
    name: string;
    createdAt: number;
    userId: import("convex/values").GenericId<"users">;
    slug: string;
    plan: "website" | "webapp" | "authdb" | "ai";
    status: "preview" | "creating" | "live" | "suspended" | "deleted";
} | null>>;
export declare const listProjects: import("convex/server").RegisteredQuery<"public", {}, Promise<{
    _id: import("convex/values").GenericId<"projects">;
    _creationTime: number;
    resellerId?: import("convex/values").GenericId<"users"> | undefined;
    prospectId?: import("convex/values").GenericId<"prospects"> | undefined;
    prompt?: string | undefined;
    vercelProjectId?: string | undefined;
    githubRepoId?: string | undefined;
    primaryUrl?: string | undefined;
    name: string;
    createdAt: number;
    userId: import("convex/values").GenericId<"users">;
    slug: string;
    plan: "website" | "webapp" | "authdb" | "ai";
    status: "preview" | "creating" | "live" | "suspended" | "deleted";
}[]>>;
export declare const getAll: import("convex/server").RegisteredQuery<"public", {}, Promise<{
    _id: import("convex/values").GenericId<"projects">;
    _creationTime: number;
    resellerId?: import("convex/values").GenericId<"users"> | undefined;
    prospectId?: import("convex/values").GenericId<"prospects"> | undefined;
    prompt?: string | undefined;
    vercelProjectId?: string | undefined;
    githubRepoId?: string | undefined;
    primaryUrl?: string | undefined;
    name: string;
    createdAt: number;
    userId: import("convex/values").GenericId<"users">;
    slug: string;
    plan: "website" | "webapp" | "authdb" | "ai";
    status: "preview" | "creating" | "live" | "suspended" | "deleted";
}[]>>;
export declare const createProject: import("convex/server").RegisteredMutation<"public", {
    prompt?: string | undefined;
    name: string;
    slug: string;
    plan: "website" | "webapp" | "authdb" | "ai";
}, Promise<import("convex/values").GenericId<"projects">>>;
export declare const updateProjectStatus: import("convex/server").RegisteredMutation<"public", {
    id: import("convex/values").GenericId<"projects">;
    status: "creating" | "live" | "suspended" | "deleted";
}, Promise<void>>;
export declare const updateProject: import("convex/server").RegisteredMutation<"public", {
    status?: "creating" | "live" | "suspended" | "deleted" | undefined;
    vercelProjectId?: string | undefined;
    githubRepoId?: string | undefined;
    primaryUrl?: string | undefined;
    id: import("convex/values").GenericId<"projects">;
}, Promise<void>>;
export declare const getBySlug: import("convex/server").RegisteredQuery<"public", {
    slug: string;
}, Promise<{
    _id: import("convex/values").GenericId<"projects">;
    _creationTime: number;
    resellerId?: import("convex/values").GenericId<"users"> | undefined;
    prospectId?: import("convex/values").GenericId<"prospects"> | undefined;
    prompt?: string | undefined;
    vercelProjectId?: string | undefined;
    githubRepoId?: string | undefined;
    primaryUrl?: string | undefined;
    name: string;
    createdAt: number;
    userId: import("convex/values").GenericId<"users">;
    slug: string;
    plan: "website" | "webapp" | "authdb" | "ai";
    status: "preview" | "creating" | "live" | "suspended" | "deleted";
} | null>>;
//# sourceMappingURL=projects.d.ts.map