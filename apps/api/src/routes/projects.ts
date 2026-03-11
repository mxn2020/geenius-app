import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { ConvexHttpClient } from "convex/browser"
import { CreateProjectSchema } from "@geenius/shared-validators"
import { z } from "zod"
import { authMiddleware } from "../middleware/auth.js"
import { rateLimitMiddleware } from "../middleware/rateLimit.js"
import { JobQueueService } from "../services/jobQueue.js"
import { ok, err } from "../lib/response.js"
import { AppError } from "../lib/errors.js"
import { env } from "../env.js"

const convex = new ConvexHttpClient(env.CONVEX_URL!)
const jobQueue = new JobQueueService(env.WORKER_QUEUE_URL ?? "")

export const projectsRouter = new Hono()
projectsRouter.use("*", authMiddleware)

const UpgradePlanSchema = z.object({ plan: z.enum(["website", "webapp", "authdb", "ai"]) })

// Rate limit: max 3 project creates per user per hour
projectsRouter.post("/", rateLimitMiddleware(3, 3_600_000), zValidator("json", CreateProjectSchema), async (c) => {
  try {
    const input = c.req.valid("json")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projectId = await convex.mutation("projects:createProject" as any, {
      name: input.name,
      slug: input.slug,
      plan: input.plan,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobId = await convex.mutation("jobs:createJob" as any, {
      projectId,
      type: "create",
    })
    await jobQueue.pushJob(jobId as string, "create", projectId as string)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = await convex.query("projects:getProject" as any, { id: projectId })
    return ok(c, { project, jobId }, 201)
  } catch (e) {
    if (e instanceof Error && e.message.includes("Slug already taken")) {
      return err(c, new AppError("SLUG_TAKEN", "This slug is already in use", 409))
    }
    return err(c, e)
  }
})

projectsRouter.get("/", async (c) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const projects = await convex.query("projects:listProjects" as any, {})
    return ok(c, projects)
  } catch (e) {
    return err(c, e)
  }
})

projectsRouter.get("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = await convex.query("projects:getProject" as any, { id })
    if (!project) return err(c, new AppError("NOT_FOUND", "Project not found", 404))
    return ok(c, project)
  } catch (e) {
    return err(c, e)
  }
})

const PLAN_TIERS: Record<string, number> = { website: 1, webapp: 2, authdb: 3, ai: 4 }

projectsRouter.post("/:id/redeploy", async (c) => {
  try {
    const projectId = c.req.param("id")
    // Verify project exists and is live
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = await convex.query("projects:getProject" as any, { id: projectId })
    if (!project) return err(c, new AppError("NOT_FOUND", "Project not found", 404))
    if (project.status !== "live") {
      return err(c, new AppError("INVALID_STATE", "Project must be live to redeploy", 409))
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobId = await convex.mutation("jobs:createJob" as any, { projectId, type: "redeploy" })
    await jobQueue.pushJob(jobId as string, "redeploy", projectId)
    return ok(c, { jobId })
  } catch (e) {
    return err(c, e)
  }
})

projectsRouter.post("/:id/upgrade-plan", zValidator("json", UpgradePlanSchema), async (c) => {
  try {
    const projectId = c.req.param("id")
    const { plan: newPlan } = c.req.valid("json")
    // Verify project exists and validate upgrade direction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = await convex.query("projects:getProject" as any, { id: projectId })
    if (!project) return err(c, new AppError("NOT_FOUND", "Project not found", 404))
    const currentTier = PLAN_TIERS[project.plan] ?? 0
    const newTier = PLAN_TIERS[newPlan] ?? 0
    if (newTier <= currentTier) {
      return err(c, new AppError("INVALID_UPGRADE", `Cannot upgrade from '${project.plan}' to '${newPlan}' — new plan must be a higher tier`, 400))
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobId = await convex.mutation("jobs:createJob" as any, { projectId, type: "upgrade" })
    await jobQueue.pushJob(jobId as string, "upgrade", projectId)
    return ok(c, { jobId, plan: newPlan })
  } catch (e) {
    return err(c, e)
  }
})

