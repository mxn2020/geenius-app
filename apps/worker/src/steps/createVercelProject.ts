import type { JobContext } from "../lib/context.js"

export async function createVercelProject(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{
    slug: string
    githubRepoId?: string
    vercelProjectId?: string
  }>("projects:getProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")

  if (project.vercelProjectId) {
    await ctx.log("info", `Vercel project already exists: ${project.vercelProjectId}`)
    return
  }

  const apiToken = process.env["VERCEL_API_TOKEN"] ?? ""
  const teamId = process.env["VERCEL_TEAM_ID"]

  await ctx.log("info", `Creating Vercel project for ${project.slug}`)

  const qs = teamId ? `?teamId=${teamId}` : ""
  const res = await fetch(`https://api.vercel.com/v9/projects${qs}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `geenius-${project.slug}`,
      ...(project.githubRepoId
        ? { gitRepository: { type: "github", repo: project.githubRepoId } }
        : {}),
    }),
  })
  if (!res.ok) throw new Error(`Vercel project creation failed: ${res.status}`)

  const data = await res.json() as { id: string; name: string }
  await ctx.convex.mutation("projects:updateProject", {
    id: ctx.projectId,
    vercelProjectId: data.id,
  })

  await ctx.log("info", `Vercel project created: ${data.name} (${data.id})`)
}
