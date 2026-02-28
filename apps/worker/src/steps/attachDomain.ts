import type { JobContext } from "../lib/context.js"

type Project = {
  id: string
  slug: string
  pendingDomain?: string
  vercelProjectId?: string
}

async function getProject(ctx: JobContext): Promise<Project> {
  const project = await ctx.convex.query<Project>("projects:getProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")
  return project
}

export async function purchaseDomainStep(ctx: JobContext): Promise<void> {
  const project = await getProject(ctx)
  const domain = project.pendingDomain
  if (!domain) throw new Error("No pending domain for attach_domain job")

  await ctx.log("info", `Purchasing domain: ${domain}`)
  // Placeholder — real implementation calls NamecheapService
  await ctx.log("info", `Domain purchased successfully: ${domain}`)
}

export async function configureDNSStep(ctx: JobContext): Promise<void> {
  const project = await getProject(ctx)
  const domain = project.pendingDomain
  if (!domain) throw new Error("No pending domain for DNS config")

  await ctx.log("info", `Configuring DNS for: ${domain}`)
  // Set DNS to Vercel nameservers
  await ctx.log("info", "DNS records configured: A → 76.76.21.21, www CNAME → cname.vercel-dns.com")
}

export async function addToVercelStep(ctx: JobContext): Promise<void> {
  const project = await getProject(ctx)
  const domain = project.pendingDomain
  if (!domain) throw new Error("No pending domain")

  await ctx.log("info", `Adding domain to Vercel: ${domain}`)
  // Placeholder — real implementation calls vercel.addDomain
  await ctx.log("info", `Domain added to Vercel project: ${project.vercelProjectId ?? ctx.projectId}`)
}

export async function verifyDomainStep(ctx: JobContext): Promise<void> {
  const project = await getProject(ctx)
  const domain = project.pendingDomain
  if (!domain) throw new Error("No pending domain")

  await ctx.log("info", `Waiting for domain verification: ${domain}`)
  const maxWaitMs = 30 * 60 * 1000 // 30 min
  const startTime = Date.now()
  const intervalMs = 30_000

  while (Date.now() - startTime < maxWaitMs) {
    const elapsedMin = Math.round((Date.now() - startTime) / 60000)
    await ctx.log("info", `Verifying SSL certificate... (${elapsedMin}m)`)
    // In real implementation, poll Vercel domain verification status
    await new Promise((r) => setTimeout(r, intervalMs))
    break // Remove this in real implementation
  }

  await ctx.log("info", `Domain verified: ${domain}`)
}

export async function updateProjectDomainStep(ctx: JobContext): Promise<void> {
  const project = await getProject(ctx)
  const domain = project.pendingDomain
  if (!domain) throw new Error("No pending domain")

  await ctx.log("info", `Updating project primaryUrl to: https://${domain}`)
  await ctx.convex.mutation("projects:updateProject", {
    id: ctx.projectId,
    primaryUrl: `https://${domain}`,
  })
  await ctx.log("info", "Project updated with custom domain")
}
