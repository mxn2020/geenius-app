import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { ConvexHttpClient } from "convex/browser"
import { CreateProjectSchema } from "@geenius/shared-validators"
import { z } from "zod"
import { authMiddleware } from "../middleware/auth.js"
import { JobQueueService } from "../services/jobQueue.js"
import { ok, err } from "../lib/response.js"
import { AppError } from "../lib/errors.js"
import { env } from "../env.js"

const convex = new ConvexHttpClient(env.CONVEX_URL ?? "")
const jobQueue = new JobQueueService(env.WORKER_QUEUE_URL ?? "")

export const projectsRouter = new Hono()
projectsRouter.use("*", authMiddleware)

const UpgradePlanSchema = z.object({ plan: z.enum(["website", "webapp", "authdb", "ai"]) })

projectsRouter.post("/", zValidator("json", CreateProjectSchema), async (c) => {
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

projectsRouter.post("/:id/redeploy", async (c) => {
  try {
    const projectId = c.req.param("id")
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
    const { plan } = c.req.valid("json")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jobId = await convex.mutation("jobs:createJob" as any, { projectId, type: "upgrade" })
    await jobQueue.pushJob(jobId as string, "upgrade", projectId)
    return ok(c, { jobId, plan })
  } catch (e) {
    return err(c, e)
  }
})
