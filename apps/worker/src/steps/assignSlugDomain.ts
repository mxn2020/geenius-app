import type { JobContext } from "../lib/context.js"

export async function assignSlugDomain(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{
    slug: string
    vercelProjectId?: string
  }>("projects:getProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")
  if (!project.vercelProjectId) throw new Error("Vercel project not created yet")

  const subdomain = `${project.slug}.geenius.dev`
  const apiToken = process.env["VERCEL_API_TOKEN"] ?? ""
  const teamId = process.env["VERCEL_TEAM_ID"]
  const qs = teamId ? `?teamId=${teamId}` : ""

  await ctx.log("info", `Assigning subdomain ${subdomain} to Vercel project`)

  const res = await fetch(
    `https://api.vercel.com/v9/projects/${project.vercelProjectId}/domains${qs}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: subdomain }),
    }
  )
  if (!res.ok && res.status !== 409) {
    throw new Error(`Failed to assign subdomain: ${res.status}`)
  }

  await ctx.log("info", `Subdomain ${subdomain} assigned`)
}
