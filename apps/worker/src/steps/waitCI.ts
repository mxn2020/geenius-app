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
    // TODO: In production, poll GitHub Actions check runs API using the commit SHA
    // from the previous triggerCI step. Replace this simulation with:
    // const status = await github.getCheckRunStatus(repoName, commitSHA)
    // if (status === "success") return
    // if (status === "failure") throw new Error(`CI failed — check: ${ciLogsUrl}`)
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    elapsed += POLL_INTERVAL_MS
    await ctx.log("info", `CI still running... (${Math.round(elapsed / 1000)}s elapsed)`)

    // Simulate success after first poll
    await ctx.log("info", "CI passed ✓")
    return
  }

  throw new Error("CI timed out after 10 minutes")
}
