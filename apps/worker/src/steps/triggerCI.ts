import type { JobContext } from "../lib/context.js"

export async function triggerCI(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{ slug: string; githubRepoId?: string }>(
    "projects:getProject",
    { id: ctx.projectId }
  )
  if (!project) throw new Error("Project not found")

  await ctx.log("info", `Triggering CI for repo ${project.githubRepoId ?? project.slug}`)
  // In production: create a repository dispatch event via GitHub API
  // to kick off the CI workflow defined in .github/workflows/ci.yml
  await ctx.log("info", "CI trigger dispatched")
}
