import type { Context } from "hono"
import { AppError } from "./errors.js"

export function ok<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json({ ok: true, data }, status)
}

export function err(c: Context, error: unknown) {
  if (error instanceof AppError) {
    return c.json(
      { ok: false, error: error.message, code: error.code, details: error.details },
      error.status as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500
    )
  }
  if (error instanceof Error) {
    return c.json({ ok: false, error: error.message, code: "INTERNAL_ERROR" }, 500)
  }
  return c.json({ ok: false, error: "Unknown error", code: "INTERNAL_ERROR" }, 500)
}
