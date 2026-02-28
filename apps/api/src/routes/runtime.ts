import { Hono } from "hono"
import { z } from "zod"
import { zValidator } from "@hono/zod-validator"
import { ConvexHttpClient } from "convex/browser"
import { ok, err } from "../lib/response.js"
import { AppError } from "../lib/errors.js"
import { calculateCredits } from "../lib/credits.js"
import type { AIModel } from "@geenius/shared-types"
import { env } from "../env.js"

const convex = new ConvexHttpClient(env.CONVEX_URL ?? "")

// Per-project rate limiting: 10 AI requests per minute
const AI_RATE_LIMIT = 10
const AI_RATE_WINDOW_MS = 60_000
const aiRateBuckets = new Map<string, { count: number; resetAt: number }>()

function checkAIRateLimit(projectId: string): boolean {
  const now = Date.now()
  const bucket = aiRateBuckets.get(projectId)
  if (!bucket || now > bucket.resetAt) {
    aiRateBuckets.set(projectId, { count: 1, resetAt: now + AI_RATE_WINDOW_MS })
    return true
  }
  if (bucket.count >= AI_RATE_LIMIT) return false
  bucket.count++
  return true
}

export const runtimeRouter = new Hono()

runtimeRouter.get("/runtime/:projectPublicId/config", async (c) => {
  try {
    const slug = c.req.param("projectPublicId")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const project = await convex.query("projects:getBySlug" as any, { slug })
    if (!project) return err(c, new AppError("NOT_FOUND", "Project not found", 404))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = await convex.query("project_settings:getByProject" as any, { projectId: project._id })
    return ok(c, {
      projectId: project._id,
      plan: project.plan,
      aiModel: settings?.aiModel ?? "gpt-4o-mini",
    })
  } catch (e) {
    return err(c, e)
  }
})

const AIProxySchema = z.object({
  model: z.enum(["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "claude-3-haiku"]),
  messages: z.array(z.object({ role: z.string(), content: z.string() })),
  maxTokens: z.number().optional(),
  requestId: z.string().optional(),
})

runtimeRouter.post(
  "/runtime/:projectPublicId/ai",
  zValidator("json", AIProxySchema),
  async (c) => {
    try {
      const slug = c.req.param("projectPublicId")
      const { model, messages, maxTokens, requestId: clientRequestId } = c.req.valid("json")

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const project = await convex.query("projects:getBySlug" as any, { slug })
      if (!project) return err(c, new AppError("NOT_FOUND", "Project not found", 404))

      // Per-project rate limiting (10 AI requests per minute)
      if (!checkAIRateLimit(project._id)) {
        return c.json({ error: "Too Many Requests", code: "RATE_LIMIT_EXCEEDED" }, 429)
      }

      // Check project credits before calling the AI model
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const balance = await convex.query("ai:getCreditBalance" as any, { projectId: project._id })
      if (typeof balance === "number" && balance <= 0) {
        return c.json({ error: "Payment Required", code: "CREDITS_EXHAUSTED" }, 402)
      }

      const requestId = clientRequestId ?? crypto.randomUUID()
      const isAnthropic = model.startsWith("claude")
      const apiKey = isAnthropic ? env.ANTHROPIC_API_KEY : env.OPENAI_API_KEY
      if (!apiKey) return err(c, new AppError("NO_API_KEY", "AI service not configured", 503))

      let response: { content: string; inputTokens: number; outputTokens: number }

      if (isAnthropic) {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens ?? 1024,
          }),
        })
        if (!res.ok) throw new AppError("AI_ERROR", `AI request failed: ${res.status}`, 502)
        const data = await res.json() as {
          content: Array<{ text: string }>
          usage: { input_tokens: number; output_tokens: number }
        }
        response = {
          content: data.content[0]?.text ?? "",
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
        }
      } else {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: maxTokens ?? 1024,
          }),
        })
        if (!res.ok) throw new AppError("AI_ERROR", `AI request failed: ${res.status}`, 502)
        const data = await res.json() as {
          choices: Array<{ message: { content: string } }>
          usage: { prompt_tokens: number; completion_tokens: number }
        }
        response = {
          content: data.choices[0]?.message.content ?? "",
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
        }
      }

      const credits = calculateCredits(model as AIModel, response.inputTokens, response.outputTokens)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await convex.mutation("ai:deductCredits" as any, {
        projectId: project._id,
        credits,
        model,
        requestId,
      })

      return ok(c, { content: response.content, credits, requestId })
    } catch (e) {
      return err(c, e)
    }
  }
)
