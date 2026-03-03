// ─── Users ───────────────────────────────────────────
export type UserRole = 'superAdmin' | 'user' | 'reseller'
export type User = {
  id: string
  convexUserId: string
  stripeCustomerId: string | null
  role: UserRole | null
  createdAt: number
}

// ─── Projects ────────────────────────────────────────
export type ProjectPlan = 'website' | 'webapp' | 'authdb' | 'ai'
export type ProjectStatus = 'preview' | 'creating' | 'live' | 'suspended' | 'deleted'
export type Project = {
  id: string
  userId: string
  resellerId?: string
  prospectId?: string
  name: string
  slug: string
  plan: ProjectPlan
  status: ProjectStatus
  vercelProjectId: string | null
  primaryUrl: string | null
  createdAt: number
}

// ─── Jobs ────────────────────────────────────────────
export type JobType = 'create' | 'upgrade' | 'redeploy' | 'attach_domain' | 'release' | 'preview' | 'convert' | 'campaign_send'
export type JobState = 'queued' | 'running' | 'failed' | 'done'
export type JobStep =
  | 'reserve_slug'
  | 'create_github_repo'
  | 'push_template'
  | 'invoke_agent_task'
  | 'wait_agent_task'
  | 'create_vercel_project'
  | 'set_env_vars'
  | 'deploy'
  | 'assign_slug_domain'
  | 'verify_live'
  | 'mark_live'
  | 'send_campaign_emails'
  | 'generate_preview_site'
  | 'convert_preview_to_live'
  | 'ai_prospect_research'
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

// ─── Domains ─────────────────────────────────────────
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

// ─── AI ──────────────────────────────────────────────
export type AIModel = 'gpt-4o' | 'gpt-4o-mini' | 'claude-3-5-sonnet' | 'claude-3-haiku'
export type AIAllowancePeriod = {
  id: string
  projectId: string
  periodStart: number
  periodEnd: number
  creditsGranted: number
  creditsUsed: number
}

// ─── Reseller ────────────────────────────────────────
export type ResellerProfile = {
  id: string
  userId: string
  companyName: string
  logoUrl: string | null
  primaryColor: string | null
  customDomain: string | null
  resendApiKey: string | null
  stripeConnectAccountId: string | null
  emailFromName: string | null
  emailFromDomain: string | null
  onboardingComplete: boolean
  createdAt: number
}

export type ProspectStatus = 'new' | 'contacted' | 'negotiating' | 'won' | 'lost'
export type Prospect = {
  id: string
  resellerId: string
  businessName: string
  contactName: string | null
  email: string | null
  phone: string | null
  website: string | null
  location: string
  niche: string
  status: ProspectStatus
  previewProjectId: string | null
  aiSummary: string | null
  createdAt: number
}

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed'
export type ComplianceMarket = 'EU' | 'US' | 'UK' | 'DACH'
export type Campaign = {
  id: string
  resellerId: string
  name: string
  niche: string
  location: string
  status: CampaignStatus
  complianceMarket: ComplianceMarket
  complianceAcknowledged: boolean
  templateSubject: string
  templateBody: string
  totalProspects: number
  totalSent: number
  totalOpened: number
  totalReplied: number
  createdAt: number
}

export type CampaignEmailStatus = 'queued' | 'sent' | 'opened' | 'replied' | 'bounced' | 'failed'
export type CampaignEmail = {
  id: string
  campaignId: string
  prospectId: string
  status: CampaignEmailStatus
  sentAt: number | null
  openedAt: number | null
  repliedAt: number | null
  resendMessageId: string | null
}

export type ConversationDirection = 'inbound' | 'outbound'
export type ProspectConversation = {
  id: string
  prospectId: string
  direction: ConversationDirection
  subject: string | null
  body: string
  timestamp: number
  resendMessageId: string | null
}

export type ComplianceSeverity = 'info' | 'warning' | 'critical'
export type ComplianceRule = {
  id: string
  market: ComplianceMarket
  ruleName: string
  description: string
  severity: ComplianceSeverity
  updatedAt: number
}

export type CallScheduleStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
export type CallSchedule = {
  id: string
  prospectId: string
  resellerId: string
  scheduledAt: number
  status: CallScheduleStatus
  meetingUrl: string | null
  notes: string | null
  createdAt: number
}

export type ResellerUsage = {
  id: string
  resellerId: string
  month: string
  deployedProjects: number
  emailsSent: number
  aiCreditsUsed: number
  revenueCollectedCents: number | null
  platformFeeCents: number | null
}

// ─── Plan Pricing ────────────────────────────────────
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
