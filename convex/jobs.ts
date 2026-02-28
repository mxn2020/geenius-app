import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const getJob = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id)
  },
})

export const getJobLogs = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
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
    type: v.union(v.literal("create"), v.literal("upgrade"), v.literal("redeploy"), v.literal("attach_domain"), v.literal("release")),
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
    return ctx.db
      .query("jobs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect()
  },
})
