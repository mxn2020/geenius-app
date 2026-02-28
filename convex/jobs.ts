import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

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

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    type: v.union(v.literal("create"), v.literal("upgrade"), v.literal("redeploy"), v.literal("attach_domain"), v.literal("release")),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("jobs", {
      ...args,
      state: "queued",
    })
  },
})

export const updateState = mutation({
  args: {
    jobId: v.id("jobs"),
    state: v.union(v.literal("queued"), v.literal("running"), v.literal("failed"), v.literal("done")),
    step: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { jobId, ...updates } = args
    const patch: Record<string, unknown> = { state: updates.state }
    if (updates.step !== undefined) patch["step"] = updates.step
    if (updates.error !== undefined) patch["error"] = updates.error
    if (updates.state === "running") patch["startedAt"] = Date.now()
    if (updates.state === "done" || updates.state === "failed") patch["finishedAt"] = Date.now()
    await ctx.db.patch(jobId, patch)
  },
})

export const addLog = mutation({
  args: {
    jobId: v.id("jobs"),
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("job_logs", {
      ...args,
      timestamp: Date.now(),
    })
  },
})
