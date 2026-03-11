export type LogLevel = "info" | "warn" | "error"

/** GitHub API service interface matching GitHubService from apps/api */
export interface GitHubServiceInterface {
  createRepo(orgName: string, repoName: string): Promise<{ id: number; name: string; full_name: string }>
  repoExists(orgName: string, repoName: string): Promise<boolean>
  pushTemplate(repoName: string, templatePath: string): Promise<void>
  getBranchSHA(repoName: string, branch: string): Promise<string>
  waitForCIPass(repoName: string, commitSHA: string, timeoutMs: number): Promise<void>
  createDispatchEvent(repoName: string, eventType: string): Promise<void>
}

/** Vercel API service interface matching VercelService from apps/api */
export interface VercelServiceInterface {
  createProject(name: string, repoId: string, envVars: unknown[]): Promise<{ id: string; name: string }>
  getProject(name: string): Promise<{ id: string; name: string } | null>
  addDomain(projectId: string, domain: string): Promise<void>
  removeDomain(projectId: string, domain: string): Promise<void>
  triggerDeploy(projectId: string): Promise<{ id: string; url: string }>
  getDeploymentStatus(deploymentId: string): Promise<{ id: string; url: string; readyState: string }>
  setEnvVars(projectId: string, vars: unknown[]): Promise<void>
  waitForDomainVerification(projectId: string, domain: string, timeoutMs: number): Promise<void>
}

/** Namecheap API service interface matching NamecheapService from apps/api */
export interface NamecheapServiceInterface {
  checkAvailability(domains: string[]): Promise<{ domain: string; available: boolean; priceCents: number }[]>
  getPrice(domain: string): Promise<number>
  purchaseDomain(domain: string, years: number): Promise<void>
  setDNStoVercel(domain: string): Promise<void>
  getDomainStatus(domain: string): Promise<string>
  renewDomain(domain: string): Promise<void>
}

/** Resend email service interface matching ResendService from apps/api */
export interface ResendServiceInterface {
  sendEmail(opts: {
    apiKey: string; from: string; to: string; subject: string; html: string
    replyTo?: string; tags?: { name: string; value: string }[]
  }): Promise<{ id: string }>
  sendBatch(opts: {
    apiKey: string; emails: {
      from: string; to: string; subject: string; html: string
      replyTo?: string; tags?: { name: string; value: string }[]
    }[]
  }): Promise<{ ids: string[] }>
  buildCampaignEmail(opts: {
    senderName: string; senderDomain: string; recipientEmail: string
    subject: string; body: string; prospectName: string; companyName: string
    unsubscribeUrl: string; physicalAddress: string
  }): { apiKey: string; from: string; to: string; subject: string; html: string; tags?: { name: string; value: string }[] }
}

export interface JobContext {
  jobId: string
  projectId: string
  jobType: string
  /** Arbitrary metadata for the job (e.g., campaign info, prospect data) */
  meta?: Record<string, unknown>
  log: (level: LogLevel, message: string) => Promise<void>
  convex: {
    query: <T>(fn: string, args: Record<string, unknown>) => Promise<T>
    mutation: <T>(fn: string, args: Record<string, unknown>) => Promise<T>
  }
  /** External service clients — undefined if env vars not configured */
  github?: GitHubServiceInterface
  vercel?: VercelServiceInterface
  namecheap?: NamecheapServiceInterface
  resend?: ResendServiceInterface
}
