import type { JobContext } from "./context.js"

interface StepOptions {
  maxRetries?: number
  retryDelayMs?: number
  retryable?: boolean
}

export async function runStep(
  ctx: JobContext,
  stepName: string,
  fn: () => Promise<void>,
  options: StepOptions = {}
): Promise<void> {
  const { maxRetries = 3, retryDelayMs = 2_000, retryable = true } = options
  const attempts = retryable ? maxRetries : 1

  await ctx.log("info", `Starting step: ${stepName}`)
  await ctx.convex.mutation("jobs:updateJob", {
    id: ctx.jobId,
    step: stepName,
    state: "running",
  })

  let lastError: Error | undefined
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await fn()
      await ctx.log("info", `Step completed: ${stepName}`)
      return
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < attempts) {
        await ctx.log("warn", `Step ${stepName} failed (attempt ${attempt}/${attempts}): ${lastError.message}. Retrying...`)
        await new Promise((r) => setTimeout(r, retryDelayMs * attempt))
      }
    }
  }

  await ctx.log("error", `Step ${stepName} failed after ${attempts} attempt(s): ${lastError?.message}`)
  throw lastError
}
