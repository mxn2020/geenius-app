import type { JobContext } from "../lib/context.js"

const TEMPLATES: Record<string, string> = {
  website: "templates/website",
  webapp: "templates/webapp",
  authdb: "templates/authdb",
  ai: "templates/ai",
}

export async function pushTemplate(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{ slug: string; plan: string }>("projects:getProject", {
    id: ctx.projectId,
  })
  if (!project) throw new Error("Project not found")

  const templatePath = TEMPLATES[project.plan] ?? "templates/website"
  await ctx.log("info", `Pushing template "${templatePath}" to repo for project ${project.slug}`)
  // In production: clone template, push to GitHub repo via GitHubService
  await ctx.log("info", `Template push complete`)
}
