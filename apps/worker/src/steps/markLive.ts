import type { JobContext } from "../lib/context.js"

export async function markLive(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{ slug: string; status: string }>(
    "projects:getProject",
    { id: ctx.projectId }
  )
  if (!project) throw new Error("Project not found")

  await ctx.convex.mutation("projects:updateProjectStatus", {
    id: ctx.projectId,
    status: "live",
  })

  await ctx.log("info", `Project ${project.slug} is now LIVE 🎉`)
}
