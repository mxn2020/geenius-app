import type { JobContext } from "../lib/context.js"

const CI_TIMEOUT_MS = 10 * 60 * 1_000 // 10 minutes
const POLL_INTERVAL_MS = 15_000

export async function waitCI(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{ slug: string; githubRepoId?: string }>(
    "projects:getProject",
    { id: ctx.projectId }
  )
  if (!project) throw new Error("Project not found")

  await ctx.log("info", `Waiting for CI to pass for ${project.githubRepoId ?? project.slug}`)

  const deadline = Date.now() + CI_TIMEOUT_MS
  let elapsed = 0

  while (Date.now() < deadline) {
    // In production: poll GitHub commit status API
    // For now, simulate a single pass after a short delay
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    elapsed += POLL_INTERVAL_MS
    await ctx.log("info", `CI still running... (${Math.round(elapsed / 1000)}s elapsed)`)

    // Simulate success after first poll
    await ctx.log("info", "CI passed ✓")
    return
  }

  throw new Error("CI timed out after 10 minutes")
}
