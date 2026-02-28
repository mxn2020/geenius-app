import type { JobContext } from "../lib/context.js"

export async function setEnvVars(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{
    slug: string
    plan: string
    vercelProjectId?: string
  }>("projects:getProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")
  if (!project.vercelProjectId) throw new Error("Vercel project not created yet")

  const apiToken = process.env["VERCEL_API_TOKEN"] ?? ""
  const teamId = process.env["VERCEL_TEAM_ID"]
  const qs = teamId ? `?teamId=${teamId}` : ""

  const envVars = [
    { key: "NEXT_PUBLIC_PROJECT_SLUG", value: project.slug, target: ["production", "preview", "development"], type: "plain" },
    { key: "NEXT_PUBLIC_PLAN", value: project.plan, target: ["production", "preview", "development"], type: "plain" },
  ]

  await ctx.log("info", `Setting ${envVars.length} env vars on Vercel project ${project.vercelProjectId}`)

  const res = await fetch(`https://api.vercel.com/v9/projects/${project.vercelProjectId}/env${qs}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(envVars),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to set env vars: ${res.status} ${body}`)
  }

  await ctx.log("info", "Env vars set successfully")
}
