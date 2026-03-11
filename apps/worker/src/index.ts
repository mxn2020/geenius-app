import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { logger } from "hono/logger"
import { ConvexHttpClient } from "convex/browser"
import type { JobType } from "@geenius/shared-types"
import { runJob } from "./jobRunner.js"
import { env } from "./env.js"

const MAX_CONCURRENT_JOBS = 5
const STALE_JOB_TIMEOUT_MS = 10 * 60 * 1000 // 10 minutes

let activeJobs = 0
const pendingQueue: Array<() => void> = []

/**
 * Execute a job with concurrency control.
 * If max concurrent jobs exceeded, the job is queued.
 */
function executeJob(jobId: string, type: JobType, projectId: string, meta?: Record<string, unknown>) {
  const run = () => {
    activeJobs++
    console.log(`[worker] starting job ${jobId} (active: ${activeJobs}/${MAX_CONCURRENT_JOBS})`)
    runJob(jobId, type, projectId, env.CONVEX_URL, meta)
      .catch((err) => {
        console.error(`[worker] job ${jobId} failed:`, err)
      })
      .finally(() => {
        activeJobs--
        console.log(`[worker] job ${jobId} finished (active: ${activeJobs}/${MAX_CONCURRENT_JOBS})`)
        // Process next queued job if any
        const next = pendingQueue.shift()
        if (next) next()
      })
  }

  if (activeJobs < MAX_CONCURRENT_JOBS) {
    run()
  } else {
    console.log(`[worker] job ${jobId} queued (${pendingQueue.length + 1} pending)`)
    pendingQueue.push(run)
  }
}

/**
 * Crash recovery: on startup, find "running" jobs older than 10 minutes
 * and mark them as failed.
 */
async function recoverStaleJobs(): Promise<void> {
  try {
    const convex = new ConvexHttpClient(env.CONVEX_URL)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runningJobs = await convex.query("jobs:listByState" as any, { state: "running" })
    if (!runningJobs || runningJobs.length === 0) {
      console.log("[worker] crash recovery: no stale jobs found")
      return
    }

    const now = Date.now()
    let recovered = 0
    for (const job of runningJobs) {
      const startedAt = job.startedAt ?? 0
      if (now - startedAt > STALE_JOB_TIMEOUT_MS) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await convex.mutation("jobs:updateJob" as any, {
          id: job._id,
          state: "failed",
          error: "Crashed — marked failed on worker recovery",
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await convex.mutation("jobs:appendJobLog" as any, {
          jobId: job._id,
          level: "error",
          message: "Job marked as failed during crash recovery (stale for >10 minutes)",
        })
        recovered++
        console.log(`[worker] recovered stale job ${job._id}`)
      }
    }
    console.log(`[worker] crash recovery complete: ${recovered} stale job(s) recovered`)
  } catch (err) {
    console.error("[worker] crash recovery failed:", err)
  }
}

const app = new Hono()
app.use("*", logger())

app.get("/health", (c) => c.json({ ok: true, ts: Date.now(), activeJobs, pendingJobs: pendingQueue.length }))

app.post("/jobs", async (c) => {
  const body = await c.req.json() as { jobId: string; type: JobType; projectId: string; meta?: Record<string, unknown> }
  const { jobId, type, projectId, meta } = body

  if (!jobId || !type || !projectId) {
    return c.json({ error: "Missing required fields: jobId, type, projectId" }, 400)
  }

  console.log("[worker] dispatching job", { jobId, type, projectId })

  // Run with concurrency control
  executeJob(jobId, type, projectId, meta)

  return c.json({ ok: true, jobId, status: "dispatched" }, 202)
})

const port = Number(env.PORT ?? 3001)
console.log(`Worker starting on port ${port}`)

// Run crash recovery before accepting new jobs
recoverStaleJobs().then(() => {
  console.log("[worker] ready to accept jobs")
}).catch(console.error)

serve({ fetch: app.fetch, port })
