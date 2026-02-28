import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { logger } from "hono/logger"
import type { JobType } from "@geenius/shared-types"

const app = new Hono()
app.use("*", logger())

app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }))

app.post("/jobs/dispatch", async (c) => {
  const body = await c.req.json() as { jobId: string; type: JobType; projectId: string }
  console.log("[worker] dispatching job", body)
  return c.json({ ok: true, received: body })
})

const port = Number(process.env["PORT"] ?? 3001)
console.log(`Worker starting on port ${port}`)

serve({ fetch: app.fetch, port })
