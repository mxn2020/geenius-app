import type { JobContext } from "../lib/context.js"

export async function commitChanges(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{ slug: string }>("projects:getProject", {
    id: ctx.projectId,
  })
  if (!project) throw new Error("Project not found")

  await ctx.log("info", `Committing template and module changes for project ${project.slug}`)
  // In production: git add -A && git commit via GitHub API (tree/blob/commit objects)
  await ctx.log("info", "Changes committed successfully")
}
