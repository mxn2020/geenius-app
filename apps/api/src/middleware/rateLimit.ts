import type { Context, Next } from "hono"

const WINDOW_MS = 60_000
const MAX_REQUESTS = 100

const buckets = new Map<string, { count: number; resetAt: number }>()

export function rateLimitMiddleware(maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS) {
  return async function (c: Context, next: Next) {
    const userId = (c.get("userId") as string | undefined) ?? c.req.header("x-forwarded-for") ?? "anonymous"
    const now = Date.now()
    const bucket = buckets.get(userId)

    if (!bucket || now > bucket.resetAt) {
      buckets.set(userId, { count: 1, resetAt: now + windowMs })
      await next()
      return
    }

    if (bucket.count >= maxRequests) {
      return c.json({ error: "Too Many Requests", code: "RATE_LIMIT_EXCEEDED" }, 429)
    }

    bucket.count++
    await next()
  }
}
