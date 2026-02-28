import type { Context, Next } from "hono"

export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  if (!token) {
    return c.json({ error: "Unauthorized", code: "MISSING_TOKEN" }, 401)
  }
  c.set("token", token)
  try {
    const parts = token.split(".")
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>
      c.set("userId", (payload["sub"] as string | undefined) ?? (payload["userId"] as string | undefined) ?? "unknown")
    } else {
      c.set("userId", "dev-user")
    }
  } catch {
    return c.json({ error: "Unauthorized", code: "INVALID_TOKEN" }, 401)
  }
  await next()
}
