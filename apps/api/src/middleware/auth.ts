import type { Context, Next } from "hono"
import * as crypto from "node:crypto"
import { env } from "../env.js"

/**
 * JWT auth middleware — cryptographically verifies token using HMAC-SHA256.
 * Rejects forged, expired, or malformed tokens.
 */
export async function authMiddleware(c: Context, next: Next) {
  const token = c.req.header("Authorization")?.replace("Bearer ", "")
  if (!token) {
    return c.json({ error: "Unauthorized", code: "MISSING_TOKEN" }, 401)
  }

  const secret = env.CONVEX_AUTH_SECRET
  if (!secret) {
    console.error("[auth] CONVEX_AUTH_SECRET not configured")
    return c.json({ error: "Server misconfiguration", code: "NO_AUTH_SECRET" }, 500)
  }

  const parts = token.split(".")
  if (parts.length !== 3) {
    return c.json({ error: "Unauthorized", code: "INVALID_TOKEN" }, 401)
  }

  const [header, payload, signature] = parts as [string, string, string]

  try {
    // Verify HMAC-SHA256 signature
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${payload}`)
      .digest("base64url")

    const sigBuffer = Buffer.from(signature, "base64url")
    const expectedBuffer = Buffer.from(expectedSig, "base64url")

    if (sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return c.json({ error: "Unauthorized", code: "INVALID_SIGNATURE" }, 401)
    }

    // Decode and validate payload
    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as Record<string, unknown>

    // Check expiration
    if (typeof decoded.exp === "number" && decoded.exp * 1000 < Date.now()) {
      return c.json({ error: "Unauthorized", code: "TOKEN_EXPIRED" }, 401)
    }

    // Extract user ID
    const userId = (decoded.sub as string | undefined) ??
      (decoded.userId as string | undefined)
    if (!userId) {
      return c.json({ error: "Unauthorized", code: "NO_USER_ID" }, 401)
    }

    c.set("token", token)
    c.set("userId", userId)
  } catch {
    return c.json({ error: "Unauthorized", code: "INVALID_TOKEN" }, 401)
  }

  return next()
}

/**
 * Worker auth middleware — verifies a shared secret for worker-to-API calls.
 * Used for internal endpoints that the worker calls.
 */
export async function workerAuthMiddleware(c: Context, next: Next) {
  const secret = c.req.header("X-Worker-Secret")
  const expected = env.WORKER_SECRET
  if (!secret || !expected || secret !== expected) {
    return c.json({ error: "Unauthorized", code: "INVALID_WORKER_SECRET" }, 401)
  }
  return next()
}
