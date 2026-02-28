import type { JobContext } from "../lib/context.js"

const VERIFY_TIMEOUT_MS = 5 * 60 * 1_000
const POLL_INTERVAL_MS = 10_000

export async function verifyLive(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{ slug: string; primaryUrl?: string }>(
    "projects:getProject",
    { id: ctx.projectId }
  )
  if (!project) throw new Error("Project not found")

  const url = project.primaryUrl ?? `https://${project.slug}.geenius.dev`
  await ctx.log("info", `Verifying site is live at ${url}`)

  const deadline = Date.now() + VERIFY_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: "GET" })
      if (res.ok || res.status === 401 || res.status === 403) {
        await ctx.log("info", `Site is live at ${url} (status ${res.status}) ✓`)
        return
      }
      await ctx.log("info", `Site not ready yet (status ${res.status}), retrying...`)
    } catch {
      await ctx.log("info", "Site not reachable yet, retrying...")
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }

  throw new Error(`Site did not become live within timeout: ${url}`)
}
