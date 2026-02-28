import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { logger } from "hono/logger"
import type { JobType } from "@geenius/shared-types"
import { runJob } from "./jobRunner.js"

const CONVEX_URL = process.env["CONVEX_URL"] ?? ""

const app = new Hono()
app.use("*", logger())

app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }))

app.post("/jobs", async (c) => {
  const body = await c.req.json() as { jobId: string; type: JobType; projectId: string }
  const { jobId, type, projectId } = body

  if (!jobId || !type || !projectId) {
    return c.json({ error: "Missing required fields: jobId, type, projectId" }, 400)
  }

  console.log("[worker] dispatching job", { jobId, type, projectId })

  // Run asynchronously so we can return 202 immediately
  setImmediate(() => {
    runJob(jobId, type, projectId, CONVEX_URL).catch((err) => {
      console.error(`[worker] job ${jobId} failed:`, err)
    })
  })

  return c.json({ ok: true, jobId, status: "dispatched" }, 202)
})

// Legacy endpoint kept for backwards compat
app.post("/jobs/dispatch", async (c) => {
  const body = await c.req.json() as { jobId: string; type: JobType; projectId: string }
  console.log("[worker] dispatching job (legacy)", body)
  return c.json({ ok: true, received: body })
})

const port = Number(process.env["PORT"] ?? 3001)
console.log(`Worker starting on port ${port}`)

serve({ fetch: app.fetch, port })
