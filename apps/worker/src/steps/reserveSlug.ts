import type { JobContext } from "../lib/context.js"

export async function reserveSlug(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{ slug: string; _id: string }>("projects:getProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")
  const existing = await ctx.convex.query<{ _id: string } | null>("projects:getBySlug", { slug: project.slug })
  if (existing && existing._id !== ctx.projectId) {
    throw new Error(`Slug "${project.slug}" is already taken`)
  }
  await ctx.log("info", `Slug "${project.slug}" reserved`)
}
