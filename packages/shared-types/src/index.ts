// Users
export type User = {
  id: string
  convexUserId: string
  stripeCustomerId: string | null
  createdAt: number
}

// Projects
export type ProjectPlan = 'website' | 'webapp' | 'authdb' | 'ai'
export type ProjectStatus = 'creating' | 'live' | 'suspended' | 'deleted'
export type Project = {
  id: string
  userId: string
  name: string
  slug: string
  plan: ProjectPlan
  status: ProjectStatus
  vercelProjectId: string | null
  primaryUrl: string | null
  createdAt: number
}

// Jobs
export type JobType = 'create' | 'upgrade' | 'redeploy' | 'attach_domain' | 'release'
export type JobState = 'queued' | 'running' | 'failed' | 'done'
export type JobStep =
  | 'reserve_slug'
  | 'create_github_repo'
  | 'push_template'
  | 'apply_modules'
  | 'commit_changes'
  | 'trigger_ci'
  | 'wait_ci'
  | 'create_vercel_project'
  | 'set_env_vars'
  | 'deploy'
  | 'assign_slug_domain'
  | 'verify_live'
  | 'mark_live'
export type Job = {
  id: string
  projectId: string
  type: JobType
  state: JobState
  step: JobStep | null
  startedAt: number | null
  finishedAt: number | null
  error: string | null
}

// Domains
export type DomainStatus = 'purchased' | 'configuring' | 'verifying' | 'active' | 'failed'
export type Domain = {
  id: string
  projectId: string
  domainName: string
  registrar: string
  registrarDomainId: string | null
  status: DomainStatus
  purchasePriceCents: number
  renewalPriceCents: number
  renewalDate: number | null
}

// AI
export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'claude-3-5-sonnet' | 'claude-3-haiku'
export type AIAllowancePeriod = {
  id: string
  projectId: string
  periodStart: number
  periodEnd: number
  creditsGranted: number
  creditsUsed: number
}

// Plan pricing map
export const PLAN_PRICES_EUR: Record<ProjectPlan, number> = {
  website: 10,
  webapp: 20,
  authdb: 30,
  ai: 40,
}

export const PLAN_AI_CREDITS: Record<ProjectPlan, number | null> = {
  website: null,
  webapp: null,
  authdb: null,
  ai: 10000,
}
