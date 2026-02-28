import type { JobContext } from "../lib/context.js"

const DEPLOY_TIMEOUT_MS = 10 * 60 * 1_000
const POLL_INTERVAL_MS = 10_000

export async function deploy(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{
    slug: string
    vercelProjectId?: string
  }>("projects:getProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")
  if (!project.vercelProjectId) throw new Error("Vercel project not created yet")

  const apiToken = process.env["VERCEL_API_TOKEN"] ?? ""
  const teamId = process.env["VERCEL_TEAM_ID"]
  const qs = teamId ? `?teamId=${teamId}` : ""

  await ctx.log("info", `Triggering deployment for Vercel project ${project.vercelProjectId}`)

  const deployRes = await fetch(`https://api.vercel.com/v13/deployments${qs}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: project.vercelProjectId, target: "production" }),
  })
  if (!deployRes.ok) throw new Error(`Failed to trigger deployment: ${deployRes.status}`)
  const deployment = await deployRes.json() as { id: string; url: string }

  await ctx.log("info", `Deployment started: ${deployment.id}`)

  const deadline = Date.now() + DEPLOY_TIMEOUT_MS
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
    const statusRes = await fetch(`https://api.vercel.com/v13/deployments/${deployment.id}${qs}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    })
    if (!statusRes.ok) continue
    const status = await statusRes.json() as { readyState: string; url?: string }

    await ctx.log("info", `Deployment status: ${status.readyState}`)

    if (status.readyState === "READY") {
      await ctx.convex.mutation("projects:updateProject", {
        id: ctx.projectId,
        primaryUrl: `https://${status.url ?? `${project.slug}.vercel.app`}`,
      })
      await ctx.log("info", `Deployment ready: https://${status.url}`)
      return
    }
    if (status.readyState === "ERROR" || status.readyState === "CANCELED") {
      throw new Error(`Deployment ended with state: ${status.readyState}`)
    }
  }

  throw new Error("Deployment timed out")
}
