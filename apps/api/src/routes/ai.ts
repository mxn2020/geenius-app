import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { ConvexHttpClient } from "convex/browser"
import { authMiddleware } from "../middleware/auth.js"
import { ok, err } from "../lib/response.js"
import { AppError } from "../lib/errors.js"
import { env } from "../env.js"

const convex = new ConvexHttpClient(env.CONVEX_URL ?? "")

export const aiRouter = new Hono()

const UpdateAIModelSchema = z.object({
  model: z.enum(["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "claude-3-haiku"]),
})

aiRouter.put(
  "/projects/:id/settings/ai-model",
  authMiddleware,
  zValidator("json", UpdateAIModelSchema),
  async (c) => {
    try {
      const projectId = c.req.param("id")
      const { model } = c.req.valid("json")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await convex.mutation("project_settings:upsert" as any, { projectId, aiModel: model })
      return ok(c, { model })
    } catch (e) {
      return err(c, e)
    }
  }
)

aiRouter.get("/projects/:id/ai/usage", authMiddleware, async (c) => {
  try {
    const projectId = c.req.param("id")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [allowance, used] = await Promise.all([
      convex.query("ai:getCurrentAllowance" as any, { projectId }),
      convex.query("ai:getAIUsage" as any, { projectId }),
    ])
    if (!allowance) return err(c, new AppError("NOT_FOUND", "No active allowance period", 404))
    return ok(c, { allowance, creditsUsed: used })
  } catch (e) {
    return err(c, e)
  }
})
