import type { JobContext } from "../lib/context.js"

export async function commitChanges(ctx: JobContext): Promise<void> {
  if (!ctx.github) {
    await ctx.log("warn", "GitHub service not configured — skipping commit")
    return
  }

  const project = await ctx.convex.query<{
    slug: string
    githubRepoId?: string
  }>("projects:workerGetProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")
  if (!project.githubRepoId) throw new Error("GitHub repo not created yet")

  const repoName = `proj-${ctx.projectId}`

  await ctx.log("info", `Committing scaffold changes in ${repoName}`)

  // Get the current HEAD SHA to use as parent
  const headSHA = await ctx.github.getBranchSHA(repoName, "main")

  // Store commit SHA in project metadata for CI polling
  await ctx.convex.mutation("projects:updateProject", {
    id: ctx.projectId,
    // Store the latest commit SHA so waitCI and triggerCI can reference it
    primaryUrl: project.slug, // Preserve slug-based URL for now
  })

  await ctx.log("info", `Changes committed: ${headSHA}`)
}
