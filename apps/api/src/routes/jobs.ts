import { Hono } from "hono"
import { ConvexHttpClient } from "convex/browser"
import { authMiddleware } from "../middleware/auth.js"
import { ok, err } from "../lib/response.js"
import { AppError } from "../lib/errors.js"
import { env } from "../env.js"

const convex = new ConvexHttpClient(env.CONVEX_URL ?? "")

export const jobsRouter = new Hono()
jobsRouter.use("*", authMiddleware)

jobsRouter.get("/:projectId/jobs/:jobId", async (c) => {
  try {
    const jobId = c.req.param("jobId")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = await convex.query("jobs:getJob" as any, { id: jobId })
    if (!job) return err(c, new AppError("NOT_FOUND", "Job not found", 404))
    return ok(c, job)
  } catch (e) {
    return err(c, e)
  }
})

jobsRouter.get("/:projectId/jobs/:jobId/logs", async (c) => {
  const jobId = c.req.param("jobId")
  c.header("Content-Type", "text/event-stream")
  c.header("Cache-Control", "no-cache")
  c.header("Connection", "keep-alive")

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logs = await convex.query("jobs:getJobLogs" as any, { jobId })
        for (const log of logs as Array<{ timestamp: number; level: string; message: string }>) {
          send(JSON.stringify(log))
        }
        send(JSON.stringify({ done: true }))
      } catch (e) {
        send(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
})
