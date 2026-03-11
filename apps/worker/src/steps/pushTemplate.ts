import type { JobContext } from "../lib/context.js"

const PLAN_TEMPLATES: Record<string, string> = {
  website: "template-website-vite-react",
  webapp: "template-webapp-vite-react",
  authdb: "template-webapp-vite-react-convex-auth-db",
  ai: "template-webapp-vite-react-convex-auth-db-ai",
}

export async function pushTemplate(ctx: JobContext): Promise<void> {
  if (!ctx.github) {
    await ctx.log("warn", "GitHub service not configured — skipping template push")
    return
  }

  const project = await ctx.convex.query<{
    slug: string
    plan: string
    githubRepoId?: string
  }>("projects:workerGetProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")
  if (!project.githubRepoId) throw new Error("GitHub repo not created yet")

  const repoName = `proj-${ctx.projectId}`
  const templatePath = PLAN_TEMPLATES[project.plan] ?? PLAN_TEMPLATES["website"]!

  await ctx.log("info", `Pushing template "${templatePath}" to repo ${repoName}`)
  await ctx.github.pushTemplate(repoName, templatePath)
  await ctx.log("info", `Template ${templatePath} pushed successfully`)
}
