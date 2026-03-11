import type { JobContext } from "../lib/context.js"

export async function triggerCI(ctx: JobContext): Promise<void> {
  if (!ctx.github) {
    await ctx.log("warn", "GitHub service not configured — skipping CI trigger")
    return
  }

  const repoName = `proj-${ctx.projectId}`

  await ctx.log("info", `Triggering CI for repo ${repoName}`)
  await ctx.github.createDispatchEvent(repoName, "deploy")
  await ctx.log("info", `CI triggered for ${repoName}`)
}
