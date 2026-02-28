import type { JobContext } from "../lib/context.js"

export async function createGithubRepo(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{ slug: string }>("projects:getProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")

  const repoName = `project-${project.slug}`
  const orgName = process.env["GITHUB_ORG"] ?? ""

  await ctx.log("info", `Creating GitHub repo: ${orgName}/${repoName}`)

  // GitHub repo creation will be handled by GitHubService in production
  // For now record the repo name in project metadata
  await ctx.convex.mutation("projects:updateProject", {
    id: ctx.projectId,
    githubRepoId: `${orgName}/${repoName}`,
  })

  await ctx.log("info", `GitHub repo recorded: ${orgName}/${repoName}`)
}
