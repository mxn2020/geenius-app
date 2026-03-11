import type { JobContext } from "../lib/context.js"

type Project = {
  id: string
  slug: string
  pendingDomain?: string
  vercelProjectId?: string
}

async function getProject(ctx: JobContext): Promise<Project> {
  const project = await ctx.convex.query<Project>("projects:workerGetProject", { id: ctx.projectId })
  if (!project) throw new Error("Project not found")
  return project
}

export async function purchaseDomainStep(ctx: JobContext): Promise<void> {
  const project = await getProject(ctx)
  const domain = project.pendingDomain
  if (!domain) throw new Error("No pending domain for attach_domain job")

  if (!ctx.namecheap) {
    await ctx.log("warn", "Namecheap service not configured — skipping domain purchase")
    return
  }

  await ctx.log("info", `Purchasing domain: ${domain}`)
  await ctx.namecheap.purchaseDomain(domain, 1)

  // Update domain record status to configuring
  await ctx.convex.mutation("domains:workerUpdateDomainStatus", {
    projectId: ctx.projectId,
    domainName: domain,
    status: "configuring",
  })

  await ctx.log("info", `Domain purchased successfully: ${domain}`)
}

export async function configureDNSStep(ctx: JobContext): Promise<void> {
  const project = await getProject(ctx)
  const domain = project.pendingDomain
  if (!domain) throw new Error("No pending domain for DNS config")

  if (!ctx.namecheap) {
    await ctx.log("warn", "Namecheap service not configured — skipping DNS configuration")
    return
  }

  await ctx.log("info", `Configuring DNS for: ${domain}`)
  await ctx.namecheap.setDNStoVercel(domain)
  await ctx.log("info", "DNS records configured: pointing to Vercel nameservers")
}

export async function addToVercelStep(ctx: JobContext): Promise<void> {
  const project = await getProject(ctx)
  const domain = project.pendingDomain
  if (!domain) throw new Error("No pending domain")

  if (!ctx.vercel) {
    await ctx.log("warn", "Vercel service not configured — skipping domain addition")
    return
  }

  const vercelProjectId = project.vercelProjectId ?? ctx.projectId

  await ctx.log("info", `Adding domain to Vercel: ${domain}`)
  await ctx.vercel.addDomain(vercelProjectId, domain)
  await ctx.log("info", `Domain added to Vercel project: ${vercelProjectId}`)
}

export async function verifyDomainStep(ctx: JobContext): Promise<void> {
  const project = await getProject(ctx)
  const domain = project.pendingDomain
  if (!domain) throw new Error("No pending domain")

  if (!ctx.vercel) {
    await ctx.log("warn", "Vercel service not configured — skipping domain verification")
    return
  }

  const vercelProjectId = project.vercelProjectId ?? ctx.projectId
  const maxWaitMs = 30 * 60 * 1000 // 30 min

  await ctx.log("info", `Waiting for domain verification: ${domain}`)
  await ctx.vercel.waitForDomainVerification(vercelProjectId, domain, maxWaitMs)

  // Update domain status to active in Convex
  await ctx.convex.mutation("domains:workerUpdateDomainStatus", {
    projectId: ctx.projectId,
    domainName: domain,
    status: "active",
  })

  await ctx.log("info", `Domain verified and active: ${domain}`)
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
