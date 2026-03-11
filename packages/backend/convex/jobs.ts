import { query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"
import { getAuthUserId } from "@convex-dev/auth/server"

// ─── Helper: verify user owns the project associated with a job ────
async function verifyJobOwnership(
  ctx: { db: { get: (id: unknown) => Promise<unknown>; query: (table: string) => unknown } },
  jobId: unknown,
  userId: string
): Promise<{ job: Record<string, unknown>; user: Record<string, unknown> } | null> {
  const db = ctx.db as {
    get: (id: unknown) => Promise<Record<string, unknown> | null>
    query: (table: string) => {
      withIndex: (name: string, fn: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
        unique: () => Promise<Record<string, unknown> | null>
      }
    }
  }
  const user = await db
    .query("users")
    .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
    .unique()
  if (!user) return null

  const job = await db.get(jobId)
  if (!job) return null

  // SuperAdmins can see any job
  if (user.role === "superAdmin") return { job, user }

  // Otherwise verify ownership
  const project = await db.get((job as Record<string, unknown>).projectId)
  if (!project || (project as Record<string, unknown>).userId !== user._id) return null

  return { job, user }
}

export const getJob = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) return null

    const job = await ctx.db.get(args.id)
    if (!job) return null

    // SuperAdmins can see any job
    if (user.role === "superAdmin") return job

    // Otherwise verify ownership
    const project = await ctx.db.get(job.projectId)
    if (!project || project.userId !== user._id) return null

    return job
  },
})

export const getJobLogs = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) return []

    const job = await ctx.db.get(args.jobId)
    if (!job) return []

    // Verify ownership (superAdmins can see any)
    if (user.role !== "superAdmin") {
      const project = await ctx.db.get(job.projectId)
      if (!project || project.userId !== user._id) return []
    }

    return ctx.db
      .query("job_logs")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .order("asc")
      .collect()
  },
})

export const createJob = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.union(
      v.literal("create"), v.literal("upgrade"),
      v.literal("redeploy"), v.literal("attach_domain"),
      v.literal("release"),
      v.literal("preview"), v.literal("convert"),
      v.literal("campaign_send")
    ),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("jobs", {
      projectId: args.projectId,
      type: args.type,
      state: "queued",
    })
  },
})

export const updateJob = mutation({
  args: {
    id: v.id("jobs"),
    state: v.optional(v.union(v.literal("queued"), v.literal("running"), v.literal("failed"), v.literal("done"))),
    step: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args
    const patch: Record<string, unknown> = {}
    if (fields.state !== undefined) patch["state"] = fields.state
    if (fields.step !== undefined) patch["step"] = fields.step
    if (fields.error !== undefined) patch["error"] = fields.error
    if (fields.state === "running") patch["startedAt"] = Date.now()
    if (fields.state === "done" || fields.state === "failed") patch["finishedAt"] = Date.now()
    await ctx.db.patch(id, patch)
  },
})

export const appendJobLog = mutation({
  args: {
    jobId: v.id("jobs"),
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("job_logs", {
      jobId: args.jobId,
      level: args.level,
      message: args.message,
      timestamp: Date.now(),
    })
  },
})

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) return []

    // Verify ownership (superAdmins can see any)
    if (user.role !== "superAdmin") {
      const project = await ctx.db.get(args.projectId)
      if (!project || project.userId !== user._id) return []
    }

    return ctx.db
      .query("jobs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect()
  },
})

/** Admin-only: list all jobs across the platform */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user || user.role !== "superAdmin") return []

    return ctx.db
      .query("jobs")
      .order("desc")
      .take(200)
  },
})

/** Alias used by mobile logs screen */
export const listJobsByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) return []

    // Verify ownership (superAdmins can see any)
    if (user.role !== "superAdmin") {
      const project = await ctx.db.get(args.projectId)
      if (!project || project.userId !== user._id) return []
    }

    return ctx.db
      .query("jobs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect()
  },
})

export const listJobLogs = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) return []
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_user", (q) => q.eq("convexUserId", userId))
      .unique()
    if (!user) return []

    const job = await ctx.db.get(args.jobId)
    if (!job) return []

    // Verify ownership (superAdmins can see any)
    if (user.role !== "superAdmin") {
      const project = await ctx.db.get(job.projectId)
      if (!project || project.userId !== user._id) return []
    }

    return ctx.db
      .query("job_logs")
      .withIndex("by_job", (q) => q.eq("jobId", args.jobId))
      .order("asc")
      .collect()
  },
})

// ─── Worker-callable queries (used by worker via ConvexHttpClient) ────

/** List jobs by state — used by worker crash recovery */
export const listByState = query({
  args: { state: v.union(v.literal("queued"), v.literal("running"), v.literal("failed"), v.literal("done")) },
  handler: async (ctx, args) => {
    return ctx.db
      .query("jobs")
      .withIndex("by_state", (q) => q.eq("state", args.state))
      .collect()
  },
})
