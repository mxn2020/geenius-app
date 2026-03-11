import type { JobContext } from "../lib/context.js"

const CI_TIMEOUT_MS = 10 * 60 * 1_000 // 10 minutes

export async function waitCI(ctx: JobContext): Promise<void> {
  if (!ctx.github) {
    await ctx.log("warn", "GitHub service not configured — skipping CI wait")
    return
  }

  const repoName = `proj-${ctx.projectId}`

  await ctx.log("info", `Waiting for CI to pass on ${repoName}`)

  // Get the latest commit SHA to poll
  const commitSHA = await ctx.github.getBranchSHA(repoName, "main")
  await ctx.log("info", `Polling CI status for commit ${commitSHA.substring(0, 8)}...`)

  await ctx.github.waitForCIPass(repoName, commitSHA, CI_TIMEOUT_MS)

  await ctx.log("info", "CI passed ✓")
}
