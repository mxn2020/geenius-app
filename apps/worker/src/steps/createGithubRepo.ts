import type { JobContext } from "../lib/context.js"

export async function createGithubRepo(ctx: JobContext): Promise<void> {
  if (!ctx.github) {
    await ctx.log("warn", "GitHub service not configured — skipping repo creation")
    return
  }

  const project = await ctx.convex.query<{
    slug: string
    githubRepoId?: string
  }>("projects:workerGetProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")

  const org = process.env["GITHUB_ORG"] ?? ""
  const repoName = `proj-${ctx.projectId}`

  // Idempotent: skip if already created
  if (project.githubRepoId) {
    await ctx.log("info", `GitHub repo already exists: ${project.githubRepoId}`)
    return
  }

  await ctx.log("info", `Creating GitHub repo: ${org}/${repoName}`)
  const repo = await ctx.github.createRepo(org, repoName)

  await ctx.convex.mutation("projects:updateProject", {
    id: ctx.projectId,
    githubRepoId: repo.full_name,
  })

  await ctx.log("info", `GitHub repo created: ${repo.full_name}`)
}
