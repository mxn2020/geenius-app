import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    convexUserId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_convex_user", ["convexUserId"]),

  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    slug: v.string(),
    plan: v.union(v.literal("website"), v.literal("webapp"),
                  v.literal("authdb"), v.literal("ai")),
    status: v.union(v.literal("creating"), v.literal("live"),
                    v.literal("suspended"), v.literal("deleted")),
    vercelProjectId: v.optional(v.string()),
    githubRepoId: v.optional(v.string()),
    primaryUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_slug", ["slug"]),

  project_settings: defineTable({
    projectId: v.id("projects"),
    aiModel: v.optional(v.string()),
    featureFlags: v.optional(v.object({})),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  jobs: defineTable({
    projectId: v.id("projects"),
    type: v.union(v.literal("create"), v.literal("upgrade"),
                  v.literal("redeploy"), v.literal("attach_domain"),
                  v.literal("release")),
    state: v.union(v.literal("queued"), v.literal("running"),
                   v.literal("failed"), v.literal("done")),
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

  domains: defineTable({
    projectId: v.id("projects"),
    domainName: v.string(),
    registrar: v.string(),
    registrarDomainId: v.optional(v.string()),
    status: v.union(v.literal("purchased"), v.literal("configuring"),
                    v.literal("verifying"), v.literal("active"),
                    v.literal("failed")),
    purchasePriceCents: v.number(),
    renewalPriceCents: v.number(),
    renewalDate: v.optional(v.number()),
  })
  .index("by_project", ["projectId"])
  .index("by_domain_name", ["domainName"]),

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

  secrets: defineTable({
    scope: v.union(v.literal("platform"), v.literal("project"),
                   v.literal("registrar")),
    key: v.string(),
    encryptedValue: v.string(),
    rotatedAt: v.number(),
    scopeId: v.optional(v.string()),
  }).index("by_scope_key", ["scope", "key"]),
})
