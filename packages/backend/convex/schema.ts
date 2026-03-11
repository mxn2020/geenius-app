import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"
import { authTables } from "@convex-dev/auth/server"

export default defineSchema({
  ...authTables,

  // ─── Core ───────────────────────────────────────────
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    convexUserId: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    role: v.optional(
      v.union(v.literal("superAdmin"), v.literal("user"), v.literal("reseller"))
    ),
    createdAt: v.optional(v.number()),
  }).index("by_convex_user", ["convexUserId"]),

  projects: defineTable({
    userId: v.id("users"),
    resellerId: v.optional(v.id("users")),
    prospectId: v.optional(v.id("prospects")),
    name: v.string(),
    slug: v.string(),
    prompt: v.optional(v.string()),
    plan: v.union(
      v.literal("website"), v.literal("webapp"),
      v.literal("authdb"), v.literal("ai")
    ),
    status: v.union(
      v.literal("preview"), v.literal("creating"), v.literal("live"),
      v.literal("suspended"), v.literal("deleted")
    ),
    vercelProjectId: v.optional(v.string()),
    githubRepoId: v.optional(v.string()),
    primaryUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"])
    .index("by_reseller", ["resellerId"]),

  project_settings: defineTable({
    projectId: v.id("projects"),
    aiModel: v.optional(v.string()),
    featureFlags: v.optional(v.object({})),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  // ─── Jobs ───────────────────────────────────────────
  jobs: defineTable({
    projectId: v.id("projects"),
    type: v.union(
      v.literal("create"), v.literal("upgrade"),
      v.literal("redeploy"), v.literal("attach_domain"),
      v.literal("release"),
      v.literal("preview"), v.literal("convert"),
      v.literal("campaign_send")
    ),
    state: v.union(
      v.literal("queued"), v.literal("running"),
      v.literal("failed"), v.literal("done")
    ),
    step: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_state", ["state"]),

  job_logs: defineTable({
    jobId: v.id("jobs"),
    timestamp: v.number(),
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
    message: v.string(),
  }).index("by_job", ["jobId"]),

  // ─── Domains ────────────────────────────────────────
  domains: defineTable({
    projectId: v.id("projects"),
    domainName: v.string(),
    registrar: v.string(),
    registrarDomainId: v.optional(v.string()),
    status: v.union(
      v.literal("purchased"), v.literal("configuring"),
      v.literal("verifying"), v.literal("active"),
      v.literal("failed")
    ),
    purchasePriceCents: v.number(),
    renewalPriceCents: v.number(),
    renewalDate: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_domain_name", ["domainName"]),

  // ─── Billing ────────────────────────────────────────
  subscriptions: defineTable({
    projectId: v.id("projects"),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    graceUntil: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_stripe_sub", ["stripeSubscriptionId"]),

  // ─── AI ─────────────────────────────────────────────
  ai_allowance_periods: defineTable({
    projectId: v.id("projects"),
    periodStart: v.number(),
    periodEnd: v.number(),
    creditsGranted: v.number(),
    creditsUsed: v.number(),
  }).index("by_project", ["projectId"]),

  ai_usage_events: defineTable({
    projectId: v.id("projects"),
    timestamp: v.number(),
    model: v.string(),
    credits: v.number(),
    requestId: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_request_id", ["requestId"]),

  // ─── Secrets ────────────────────────────────────────
  secrets: defineTable({
    scope: v.union(
      v.literal("platform"), v.literal("project"),
      v.literal("registrar")
    ),
    key: v.string(),
    encryptedValue: v.string(),
    rotatedAt: v.number(),
    scopeId: v.optional(v.string()),
  }).index("by_scope_key", ["scope", "key"]),

  // ─── Reseller ───────────────────────────────────────
  reseller_profiles: defineTable({
    userId: v.id("users"),
    companyName: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    customDomain: v.optional(v.string()),
    resendApiKey: v.optional(v.string()),
    stripeConnectAccountId: v.optional(v.string()),
    emailFromName: v.optional(v.string()),
    emailFromDomain: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  prospects: defineTable({
    resellerId: v.id("users"),
    businessName: v.string(),
    contactName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.string(),
    niche: v.string(),
    status: v.union(
      v.literal("new"), v.literal("contacted"),
      v.literal("negotiating"), v.literal("won"), v.literal("lost")
    ),
    previewProjectId: v.optional(v.id("projects")),
    aiSummary: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_reseller", ["resellerId"])
    .index("by_status", ["resellerId", "status"])
    .index("by_niche", ["resellerId", "niche"]),

  campaigns: defineTable({
    resellerId: v.id("users"),
    name: v.string(),
    niche: v.string(),
    location: v.string(),
    status: v.union(
      v.literal("draft"), v.literal("active"),
      v.literal("paused"), v.literal("completed")
    ),
    complianceMarket: v.union(
      v.literal("EU"), v.literal("US"),
      v.literal("UK"), v.literal("DACH")
    ),
    complianceAcknowledged: v.optional(v.boolean()),
    templateSubject: v.string(),
    templateBody: v.string(),
    totalProspects: v.optional(v.number()),
    totalSent: v.optional(v.number()),
    totalOpened: v.optional(v.number()),
    totalReplied: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_reseller", ["resellerId"])
    .index("by_status", ["resellerId", "status"]),

  campaign_emails: defineTable({
    campaignId: v.id("campaigns"),
    prospectId: v.id("prospects"),
    status: v.union(
      v.literal("queued"), v.literal("sent"),
      v.literal("opened"), v.literal("replied"),
      v.literal("bounced"), v.literal("failed")
    ),
    sentAt: v.optional(v.number()),
    openedAt: v.optional(v.number()),
    repliedAt: v.optional(v.number()),
    resendMessageId: v.optional(v.string()),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_prospect", ["prospectId"])
    .index("by_resend_id", ["resendMessageId"]),

  prospect_conversations: defineTable({
    prospectId: v.id("prospects"),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    subject: v.optional(v.string()),
    body: v.string(),
    timestamp: v.number(),
    resendMessageId: v.optional(v.string()),
  }).index("by_prospect", ["prospectId"]),

  compliance_rules: defineTable({
    market: v.union(
      v.literal("EU"), v.literal("US"),
      v.literal("UK"), v.literal("DACH")
    ),
    ruleName: v.string(),
    description: v.string(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    updatedAt: v.number(),
  }).index("by_market", ["market"]),

  call_schedules: defineTable({
    prospectId: v.id("prospects"),
    resellerId: v.id("users"),
    scheduledAt: v.number(),
    status: v.union(
      v.literal("scheduled"), v.literal("completed"),
      v.literal("cancelled"), v.literal("no_show")
    ),
    meetingUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_reseller", ["resellerId"])
    .index("by_prospect", ["prospectId"]),

  reseller_usage: defineTable({
    resellerId: v.id("users"),
    month: v.string(),
    deployedProjects: v.number(),
    emailsSent: v.number(),
    aiCreditsUsed: v.number(),
    revenueCollectedCents: v.optional(v.number()),
    platformFeeCents: v.optional(v.number()),
  })
    .index("by_reseller", ["resellerId"])
    .index("by_month", ["resellerId", "month"]),
})
