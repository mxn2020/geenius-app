import { serve } from "@hono/node-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { projectsRouter } from "./routes/projects.js"
import { webhooksRouter } from "./routes/webhooks.js"

const app = new Hono()

app.use("*", logger())
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "https://app.geenius.dev"],
    credentials: true,
  })
)

app.get("/health", (c) => c.json({ ok: true, ts: Date.now() }))

app.route("/api/projects", projectsRouter)
app.route("/api/webhooks", webhooksRouter)

const port = Number(process.env["PORT"] ?? 3000)
console.log(`API server starting on port ${port}`)

serve({ fetch: app.fetch, port })
