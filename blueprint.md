Geenius Platform — AI Implementation Prompt
Below is a structured prompt you can hand directly to an AI coding system (Cursor, Claude Code, Copilot Workspace, etc.) to implement the platform foundation sprint by sprint.

MASTER CONTEXT BLOCK

PLATFORM STACK:
- Monorepo: Turborepo
- Mobile app: Expo + React Native (customer-facing)
- Web app: Vite + React (internal admin)
- Backend API: Node.js HTTP orchestrator (Hono or Fastify)
- Worker service: Node.js long-running job runner
- Database (platform): ConvexDB
- Auth: Convex Auth
- Analytics: PostHog (web + mobile)
- Payments: Stripe
- Deployments: Vercel API
- Source control: GitHub API (hidden org)
- Domain registrar: Namecheap API
- Shared packages: shared-types, shared-ui-tokens, shared-validators, shared-api-client

REPO STRUCTURE TO GENERATE:
geenius/
  apps/
    mobile/        # Expo RN — customer facing
    web/           # Vite React — internal admin
    api/           # Hono/Fastify orchestrator
    worker/        # Job runner
  packages/
    shared-types/
    shared-ui-tokens/
    shared-validators/
    shared-api-client/
  turbo.json
  pnpm-workspace.yaml
  package.json

ABSOLUTE RULES:
1. Generated customer repos are NOT monorepos — single Vite React repo per project
2. Users see ONLY: plan/billing, domain, AI model, basic app settings
3. No GitHub/Vercel/env-var UI exposed to users ever
4. Every project defaults to slug.geenius.app
5. No bring-your-own domain — in-app purchase only
6. Domain price = max(€10, registrar_cost * 1.30)
7. ConvexDB is the single source of truth for platform state
8. All job steps must be idempotent / retry-safe


SPRINT 1 — Monorepo Skeleton + Tooling
Sub-sprint 1.1 — Turborepo Init

TASK: Initialize the Turborepo monorepo for the geenius platform.

STEPS:
1. Run `npx create-turbo@latest` with pnpm workspaces
2. Create the following workspace apps: mobile, web, api, worker
3. Create the following workspace packages: shared-types, shared-ui-tokens,
   shared-validators, shared-api-client
4. Configure turbo.json with pipelines:
   - build: depends on ^build
   - dev: persistent: true, cache: false
   - lint: no deps
   - typecheck: depends on ^typecheck
5. Root package.json scripts: dev, build, lint, typecheck, clean
6. Add .gitignore, .nvmrc (Node 20), .npmrc (shamefully-hoist=true for RN)
7. Add Prettier + ESLint with shared config in packages/eslint-config/
8. Add TypeScript base tsconfig in packages/tsconfig/ with:
   - tsconfig.base.json (strict mode, paths)
   - tsconfig.node.json (for api/worker)
   - tsconfig.react.json (for web)
   - tsconfig.react-native.json (for mobile)

ACCEPTANCE:
- `pnpm dev` starts all apps without errors
- `pnpm build` completes for api and web
- `pnpm typecheck` passes across all packages
- All packages resolve shared-types correctly


Sub-sprint 1.2 — Shared Packages Foundation

TASK: Implement the four shared packages with full TypeScript types.

packages/shared-types/src/index.ts — export all platform types:

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

packages/shared-validators/src/index.ts — Zod schemas:
- SlugSchema: z.string().min(3).max(40).regex(/^[a-z0-9-]+$/)
  .refine(s => !RESERVED_SLUGS.includes(s), 'Reserved slug')
- RESERVED_SLUGS: ['www','admin','api','app','mail','auth','billing',
  'dashboard','support','help','blog','status','dev','staging','prod']
- CreateProjectSchema: { name, plan, slug? }
- PurchaseDomainSchema: { domainName }
- UpdateAIModelSchema: { model: AIModel }

packages/shared-api-client/src/index.ts — typed fetch client:
- createApiClient(baseUrl: string, getToken: () => Promise<string>)
- Methods mirroring all /api endpoints (see Sprint 3)
- Uses shared-types for request/response shapes

packages/shared-ui-tokens/src/index.ts — design tokens:
- colors, spacing, typography, borderRadius, shadows
- Compatible with both React Native StyleSheet and CSS-in-JS

ACCEPTANCE:
- All packages compile with zero TypeScript errors
- shared-validators tests pass (vitest): valid slugs, reserved slug rejection,
  boundary lengths
- shared-api-client generates correct Authorization headers


Sub-sprint 1.3 — PostHog Setup

TASK: Integrate PostHog into both mobile and web apps.

WEB (apps/web):
- Install posthog-js
- Initialize in src/analytics.ts:
  posthog.init(VITE_POSTHOG_KEY, { api_host: 'https://app.posthog.com' })
- Export trackEvent(event: string, props?: Record<string, unknown>)
- Export identifyUser(userId: string, traits?: Record<string, unknown>)
- Wrap app in <PostHogProvider>

MOBILE (apps/mobile):
- Install posthog-react-native
- Initialize in src/analytics.ts with same interface as web
- Wrap app in <PostHogProvider>

SHARED EVENTS to track from day one:
- project_created: { plan, slug }
- project_deployed: { plan, duration_ms }
- domain_search: { query }
- domain_purchased: { tld, price_cents }
- plan_upgraded: { from, to }
- ai_request: { model, credits_used }
- job_failed: { type, step, error_code }

ACCEPTANCE:
- Events appear in PostHog dashboard in dev
- identifyUser called on Convex Auth session resolved
- No PII in event properties (no emails, no domain names in free-text)


SPRINT 2 — ConvexDB Schema + Convex Auth
Sub-sprint 2.1 — Convex Schema

TASK: Define the complete Convex schema for the platform database.

FILE: convex/schema.ts

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
  }).index("by_project", ["projectId"]),

  secrets: defineTable({
    scope: v.union(v.literal("platform"), v.literal("project"),
                   v.literal("registrar")),
    key: v.string(),
    encryptedValue: v.string(),
    rotatedAt: v.number(),
    scopeId: v.optional(v.string()),
  }).index("by_scope_key", ["scope", "key"]),
})

ALSO CREATE these Convex query/mutation files:

convex/projects.ts:
- query: getProject(id) — auth guarded (user owns project)
- query: listProjects() — returns all projects for authed user
- mutation: createProject(name, plan, slug?) — validates slug uniqueness,
  creates project in "creating" status, returns id
- mutation: updateProjectStatus(id, status) — internal only

convex/jobs.ts:
- query: getJob(id)
- query: getJobLogs(jobId) — returns ordered logs
- mutation: createJob(projectId, type) — creates queued job
- mutation: updateJob(id, fields) — internal: update state/step/error
- mutation: appendJobLog(jobId, level, message) — internal

convex/domains.ts:
- query: listDomains(projectId)
- mutation: createDomain(projectId, domainName, purchasePriceCents, renewalPriceCents)
- mutation: updateDomainStatus(id, status)

convex/ai.ts:
- query: getCurrentAllowance(projectId) — returns active period or null
- query: getAIUsage(projectId) — total credits used this period
- mutation: deductCredits(projectId, credits, model, requestId) — atomic
  check+deduct, throws if insufficient
- mutation: resetAllowancePeriod(projectId, periodStart, periodEnd) — called
  by Stripe webhook handler

ACCEPTANCE:
- npx convex dev runs without schema errors
- All queries are auth-guarded: users can only read their own data
- Slug uniqueness enforced at mutation level with proper error code
- deductCredits is atomic (uses Convex transaction guarantees)


Sub-sprint 2.2 — Convex Auth Integration

TASK: Set up Convex Auth in both mobile app and web app.

CONVEX AUTH CONFIG (convex/auth.ts):
- Provider: Email + Password (primary)
- Provider: Google OAuth (secondary)
- Configure: convex/auth.config.ts with JWT settings

MOBILE (apps/mobile):
1. Install @convex-dev/auth, convex
2. Create src/providers/ConvexProvider.tsx:
   - ConvexReactClient with EXPO_PUBLIC_CONVEX_URL
   - ConvexAuthProvider wrapping app
3. Create src/hooks/useAuth.ts:
   - signIn(email, password)
   - signUp(email, password, name)
   - signOut()
   - user (current user object)
   - isLoading
4. Create screens:
   - screens/auth/LoginScreen.tsx
   - screens/auth/SignupScreen.tsx
   - screens/auth/ForgotPasswordScreen.tsx
   Each with: form validation (react-hook-form + shared-validators),
   error display, loading states, PostHog identify on success

WEB (apps/web) — admin only, same pattern:
1. Same ConvexProvider setup
2. useAuth hook
3. Login page at /login

API AUTH MIDDLEWARE (apps/api):
- Validate Convex JWT on every protected route
- Extract userId from token
- Attach to request context: ctx.userId
- Helper: requireAuth(ctx) throws 401 if no valid token
- The API gets the Convex auth secret from environment to verify JWTs

ACCEPTANCE:
- User can sign up with email/password on mobile
- User can log in and session persists across app restarts (SecureStore)
- Invalid token returns 401 from API
- PostHog identifies user on successful auth
- Sign out clears session and redirects to login


SPRINT 3 — Orchestrator API Foundation
Sub-sprint 3.1 — API Server Scaffold

TASK: Build the Hono-based orchestrator API in apps/api.

SETUP:
- Framework: Hono (fast, TypeScript-first, works on Node + edge)
- Runtime: Node 20
- Install: hono, @hono/node-server, convex, zod, @hono/zod-validator

FILE STRUCTURE:
apps/api/src/
  index.ts          # entry point, starts server on PORT
  app.ts            # Hono app, registers all routers
  middleware/
    auth.ts         # Convex JWT validation
    rateLimit.ts    # per-user rate limiting (in-memory or Redis)
    logger.ts       # request logging
  routes/
    projects.ts
    jobs.ts
    billing.ts
    domains.ts
    ai.ts
    runtime.ts      # runtime endpoints for generated apps
  services/
    convex.ts       # ConvexClient singleton
    github.ts       # GitHub API wrapper
    vercel.ts       # Vercel API wrapper
    stripe.ts       # Stripe client
    namecheap.ts    # Namecheap registrar API wrapper
    jobQueue.ts     # push jobs to worker queue
  lib/
    errors.ts       # AppError class with code + status
    response.ts     # success/error response helpers
    secrets.ts      # decrypt secrets from Convex
  env.ts            # zod-validated environment variables

IMPLEMENT ALL ROUTES with correct auth guards and validation:

--- routes/projects.ts ---
POST /projects
  body: CreateProjectSchema
  auth: required
  - validate slug (or generate from name)
  - check slug uniqueness via Convex
  - create project in Convex (status: creating)
  - push job to worker queue (type: create)
  - return { projectId, jobId }

GET /projects
  auth: required
  - return listProjects() from Convex for authed user

GET /projects/:id
  auth: required, must own project
  - return full project with settings, latest job, domains

POST /projects/:id/redeploy
  auth: required, must own project
  - project must be in "live" status
  - push job: type=redeploy
  - return { jobId }

POST /projects/:id/upgrade-plan
  auth: required, must own project
  body: { plan: ProjectPlan }
  - validate plan is an upgrade (not downgrade for now)
  - update Stripe subscription
  - push job: type=upgrade with new plan
  - return { jobId }

--- routes/jobs.ts ---
GET /projects/:id/jobs/:jobId
  auth: required, must own project
  - return job state, step, error, timing

GET /projects/:id/jobs/:jobId/logs
  auth: required
  - SSE endpoint: Content-Type: text/event-stream
  - stream job_logs in real time via Convex subscription
  - send "done" event when job completes

--- routes/billing.ts ---
POST /projects/:id/billing/checkout-session
  auth: required
  - create Stripe Checkout Session for subscription
  - return { url }

GET /projects/:id/billing
  auth: required
  - return subscription status, period, next renewal

POST /webhook/stripe
  NO auth (uses Stripe signature verification)
  - handle: invoice.paid, invoice.payment_failed,
    customer.subscription.updated, customer.subscription.deleted
  - see Sprint 5 for full webhook logic

--- routes/domains.ts ---
GET /domains/search
  query: { query: string }
  auth: required
  - call Namecheap check API
  - compute price: max(1000, registrarCents * 1.30)
  - return availability + price to user

POST /projects/:id/domains/purchase
  auth: required, must own project
  body: PurchaseDomainSchema
  - create Stripe PaymentIntent for domain price
  - return { clientSecret } (mobile confirms payment)

POST /projects/:id/domains/purchase/confirm
  auth: required
  body: { paymentIntentId }
  - verify payment succeeded
  - create domain record in Convex (status: purchased)
  - push job: type=attach_domain
  - return { domainId, jobId }

GET /projects/:id/domains
  auth: required
  - return domains list with status

--- routes/ai.ts ---
PUT /projects/:id/settings/ai-model
  auth: required, must own project
  body: UpdateAIModelSchema
  - verify project is on "ai" plan
  - update project_settings.aiModel in Convex

GET /projects/:id/ai/usage
  auth: required
  - return { creditsGranted, creditsUsed, creditsRemaining, periodEnd }

--- routes/runtime.ts ---
(Used by generated customer apps, not by mobile app)
GET /runtime/:projectPublicId/config
  - no user auth, but validate projectPublicId is valid active project
  - return: { features, aiModel } (no secrets)

POST /runtime/:projectPublicId/ai
  body: { messages, model? }
  - validate projectPublicId → active project on AI plan
  - check credits remaining
  - call model provider
  - deduct credits atomically
  - return { content, creditsUsed }

ENVIRONMENT VARIABLES (apps/api/.env):
CONVEX_URL=
CONVEX_AUTH_SECRET=
GITHUB_ORG=
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
VERCEL_API_TOKEN=
VERCEL_TEAM_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NAMECHEAP_API_USER=
NAMECHEAP_API_KEY=
NAMECHEAP_CLIENT_IP=
ENCRYPTION_KEY=   # AES-256 key for secrets table
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
WORKER_QUEUE_URL= # internal URL of worker service

ACCEPTANCE:
- All routes return correct status codes
- 401 returned for missing/invalid token on protected routes
- 403 returned when user tries to access another user's project
- Rate limit: max 3 project creates per user per hour
- Zod validation errors return structured 422 with field-level errors
- POST /projects with duplicate slug returns 409 with code: SLUG_TAKEN


Sub-sprint 3.2 — External Service Wrappers

TASK: Implement typed wrappers for all external APIs.

services/github.ts — GitHubService class:
- Uses GitHub App authentication (JWT → installation token)
- createRepo(orgName, repoName): creates private repo in hidden org
  idempotent: if repo exists, return existing
- repoExists(orgName, repoName): boolean check
- pushTemplate(repoName, templatePath): clone template + initial commit
- getBranchSHA(repoName, branch): for CI status polling
- waitForCIPass(repoName, commitSHA, timeoutMs): polls check runs every 10s
- createDispatchEvent(repoName, eventType): manual workflow trigger

services/vercel.ts — VercelService class:
- createProject(name, repoId, envVars): creates Vercel project linked to GitHub
  idempotent: check GET /v9/projects/:name first
- getProject(name): returns project or null
- addDomain(projectId, domain): adds domain to Vercel project
  idempotent: handles "domain already assigned" error
- removeDomain(projectId, domain)
- triggerDeploy(projectId): triggers new deployment
- getDeploymentStatus(deploymentId): returns state
- setEnvVars(projectId, vars: Record<string, string>): bulk set encrypted env vars
- waitForDomainVerification(projectId, domain, timeoutMs): polls domain status

services/namecheap.ts — NamecheapService class:
- checkAvailability(domains: string[]): returns { domain, available, price }[]
- getPrice(domain: string): returns { registrarCents, userPriceCents }
  applying max(1000, registrarCents * 1.30) logic
- purchaseDomain(domain, contactInfo): registers domain
  returns { success, domainId, expiryDate }
- setNameservers(domain, nameservers: string[]): point to Vercel
- getDomainInfo(domain): status, expiry, nameservers
- renewDomain(domain): returns { success, newExpiryDate }

services/stripe.ts — StripeService class:
- createCustomer(email, userId): returns stripeCustomerId
- createSubscription(customerId, priceId, projectId): returns subscription
- updateSubscription(subId, newPriceId): returns updated subscription
- cancelSubscription(subId): cancels at period end
- createCheckoutSession(customerId, priceId, projectId, successUrl, cancelUrl)
- createPaymentIntent(amountCents, currency, metadata): for domain purchase
- verifyWebhookSignature(payload, signature): returns Stripe.Event

services/jobQueue.ts — JobQueueService:
- pushJob(jobId: string, type: JobType, projectId: string): sends to worker
  via HTTP POST to WORKER_QUEUE_URL/jobs
- Uses retry with exponential backoff (3 attempts)

EACH WRAPPER MUST:
- Have TypeScript return types using shared-types
- Log all API calls with duration (for observability)
- Throw typed AppErrors (GITHUB_ERROR, VERCEL_ERROR, etc.)
- Never expose raw API keys in logs
- Handle rate limits with automatic retry + backoff

ACCEPTANCE:
- Unit tests (vitest + msw for mocking) cover: idempotency paths, error
  handling, rate limit retry
- github.ts: createRepo called twice returns same repo without error
- vercel.ts: addDomain called twice for same domain is handled cleanly
- namecheap.ts: price calculation tests for edge cases (< €10 floor)


SPRINT 4 — Worker + Job State Machine
Sub-sprint 4.1 — Worker Service Scaffold

TASK: Build the job runner worker service in apps/worker.

SETUP:
apps/worker/src/
  index.ts          # HTTP server (receives jobs from API)
  jobRunner.ts      # orchestrates job execution
  steps/
    reserveSlug.ts
    createGithubRepo.ts
    pushTemplate.ts
    applyModules.ts
    commitChanges.ts
    triggerCI.ts
    waitCI.ts
    createVercelProject.ts
    setEnvVars.ts
    deploy.ts
    assignSlugDomain.ts
    verifyLive.ts
    markLive.ts
  lib/
    stepRunner.ts   # wraps each step with retry + logging
    convexClient.ts # to update job state in Convex

WORKER HTTP SERVER:
POST /jobs — accepts job from API:
  body: { jobId, type, projectId }
  - immediately returns 202 Accepted
  - runs job async

GET /health — returns 200

JOB RUNNER (jobRunner.ts):
async function runJob(jobId, type, projectId):
  1. load full project + settings from Convex
  2. update job state → "running" in Convex
  3. for job type "create", run steps in order:
     reserveSlug → createGithubRepo → pushTemplate → applyModules
     → commitChanges → triggerCI → waitCI → createVercelProject
     → setEnvVars → deploy → assignSlugDomain → verifyLive → markLive
  4. after each step:
     - update job.step in Convex
     - append info log to job_logs
  5. on any step failure:
     - append error log
     - update job state → "failed", job.error = message
     - stop execution
  6. on full completion:
     - update job state → "done"

STEP RUNNER (lib/stepRunner.ts):
async function runStep(jobId, stepName, fn, options?):
  - options: { maxRetries = 3, retryDelayMs = 2000, retryable = true }
  - calls fn()
  - on failure: if retryable, retry up to maxRetries with exponential backoff
  - logs each attempt to Convex job_logs
  - throws on final failure

ACCEPTANCE:
- Worker receives job, executes all steps, updates Convex correctly
- Each step is independently retryable
- Job logs appear in real time via Convex subscription
- Worker handles 5 concurrent jobs (Promise pool, max 5)
- Crash recovery: on startup, check for "running" jobs older than 10min
  and mark them "failed" (they should be re-queued by API)


Sub-sprint 4.2 — Create Project Job Steps

TASK: Implement all 13 steps of the "create" job type.

For each step, implement as exported async function:
  async function stepName(ctx: JobContext): Promise<void>

JobContext type:
{
  jobId: string
  projectId: string
  project: Project
  convex: ConvexClient
  github: GitHubService
  vercel: VercelService
  log: (level, msg) => Promise<void>
}

IMPLEMENT EACH STEP:

steps/reserveSlug.ts:
- Check slug is still unique in Convex (race condition guard)
- If taken: throw AppError("SLUG_TAKEN", "Slug was taken during creation")
- Log: "Slug reserved: {slug}"

steps/createGithubRepo.ts:
- Call github.createRepo(GITHUB_ORG, repoName)
  where repoName = `proj-${projectId}` (internal, never shown to user)
- Store githubRepoId on project in Convex
- Log: "GitHub repo created"

steps/pushTemplate.ts:
- Determine template based on plan:
  website → template-website-vite-react
  webapp → template-webapp-vite-react
  authdb → template-webapp-vite-react-convex-auth-db
  ai → template-webapp-vite-react-convex-auth-db-ai
- Clone template from geenius internal template org
- Push to customer's hidden repo as initial commit
- Log: "Template {templateName} pushed"

steps/applyModules.ts:
- Patch package.json: set name = project.slug
- Patch src/config.ts: set PROJECT_ID, PLAN, API_BASE_URL
- If plan includes AI: inject AI model config
- Write changes to working copy
- Log: "Modules applied for plan {plan}"

steps/commitChanges.ts:
- Commit all patches with message: "chore: initial scaffold [geenius]"
- Push to main branch
- Store commit SHA in job context for CI polling
- Log: "Changes committed: {sha}"

steps/triggerCI.ts:
- Wait for GitHub Actions to pick up (poll workflow runs, max 60s)
- Store workflowRunId in job context
- Log: "CI triggered, run: {runId}"

steps/waitCI.ts:
- Poll workflow run status every 15s, timeout 10min
- If conclusion = "success": continue
- If conclusion = "failure": throw with CI logs URL
- Log progress: "CI running... ({elapsed}s)"

steps/createVercelProject.ts:
- Call vercel.createProject(slug, githubRepoId, {})
- Store vercelProjectId in Convex project record
- Log: "Vercel project created: {vercelProjectId}"

steps/setEnvVars.ts:
- Build env vars map for this project:
  VITE_PROJECT_ID, VITE_API_BASE, VITE_PLAN
  + plan-specific vars (Convex URL for authdb/ai plans, etc.)
- Call vercel.setEnvVars(vercelProjectId, vars)
- Log: "Environment variables configured"

steps/deploy.ts:
- Call vercel.triggerDeploy(vercelProjectId)
- Poll deployment status every 10s, timeout 10min
- Store deploymentUrl in job context
- Log progress: "Deploying... ({elapsed}s)"

steps/assignSlugDomain.ts:
- Compute subdomain: {slug}.geenius.app
- Call vercel.addDomain(vercelProjectId, subdomain)
- Log: "Subdomain assigned: {subdomain}"

steps/verifyLive.ts:
- HTTP GET https://{slug}.geenius.app with 3 retries, 15s apart
- Expect 200 status
- Log: "Live check passed: HTTP 200"

steps/markLive.ts:
- Update project.status = "live" in Convex
- Update project.primaryUrl = "https://{slug}.geenius.app"
- Log: "Project is live 🎉"

ACCEPTANCE:
- Integration test: full "create" job runs end-to-end against
  mocked GitHub + Vercel services
- Each step is independently testable with mocked context
- Failed step at any point leaves correct job.step + job.error in Convex
- All 13 steps log meaningful messages


SPRINT 5 — Stripe Billing Integration
Sub-sprint 5.1 — Subscription Setup

TASK: Implement Stripe subscription lifecycle for projects.

STRIPE PRODUCT SETUP (run once via setup script):
scripts/stripe-setup.ts:
- Create Products:
  - "Geenius Website" → Price: €10/month recurring
  - "Geenius Web App" → Price: €20/month recurring
  - "Geenius Web App + Auth + DB" → Price: €30/month recurring
  - "Geenius Web App + Auth + DB + AI" → Price: €40/month recurring
- Store Price IDs in environment as:
  STRIPE_PRICE_WEBSITE, STRIPE_PRICE_WEBAPP,
  STRIPE_PRICE_AUTHDB, STRIPE_PRICE_AI

PLAN → PRICE ID MAPPING in services/stripe.ts:
export const PLAN_TO_PRICE: Record<ProjectPlan, string> = {
  website: process.env.STRIPE_PRICE_WEBSITE,
  webapp: process.env.STRIPE_PRICE_WEBAPP,
  authdb: process.env.STRIPE_PRICE_AUTHDB,
  ai: process.env.STRIPE_PRICE_AI,
}

CHECKOUT FLOW:
POST /projects/:id/billing/checkout-session:
1. Ensure Stripe customer exists for user (create if not, store stripeCustomerId)
2. Create Checkout Session:
   - mode: subscription
   - customer: stripeCustomerId
   - line_items: [{ price: PLAN_TO_PRICE[plan], quantity: 1 }]
   - metadata: { projectId, userId }
   - success_url: geenius://billing-success?projectId={id}
   - cancel_url: geenius://billing-cancel
3. Return { url } to mobile app
4. Mobile app opens in-app browser (Expo WebBrowser)

WEBHOOK HANDLER (routes/billing.ts → POST /webhook/stripe):
Verify signature first — reject if invalid.

invoice.paid:
- Find subscription by stripeSubscriptionId in Convex
- Update subscription.currentPeriodEnd
- Update subscription.status = "active"
- If plan === "ai": call convex.resetAllowancePeriod(projectId, start, end)
- If project.status === "suspended": push job type=redeploy

invoice.payment_failed:
- Update subscription.status = "past_due"
- Set grace period: 7 days (store graceUntil on subscription)
- TODO Sprint 6: send notification to user

customer.subscription.updated:
- Update subscription fields in Convex
- If plan changed: push job type=upgrade with { newPlan }
- Recompute feature flags

customer.subscription.deleted:
- Update subscription.status = "canceled"
- Update project.status = "suspended"
- Mark Vercel project as suspended (via Vercel API if available,
  or just DNS-level redirect to "suspended" page)

ACCEPTANCE:
- Full checkout session flow works on mobile (Expo WebBrowser → Stripe → deep link back)
- Webhook correctly updates Convex on all 4 event types
- AI credits reset to 10,000 on invoice.paid for AI plan
- Signature verification rejects tampered webhooks
- Duplicate webhook events are idempotent


SPRINT 6 — Mobile App Core UI
Sub-sprint 6.1 — Navigation + Shell

TASK: Build the core navigation structure for the Expo mobile app.

NAVIGATION STACK (Expo Router file-based routing):
app/
  _layout.tsx              # root layout, ConvexProvider, PostHogProvider
  (auth)/
    login.tsx
    signup.tsx
    forgot-password.tsx
  (app)/
    _layout.tsx            # tab navigator, auth guard
    index.tsx              # Projects list (home)
    projects/
      new.tsx              # Create project wizard
      [id]/
        index.tsx          # Project detail / dashboard
        settings.tsx       # Plan, AI model, billing
        domain.tsx         # Domain management
        logs.tsx           # Job logs viewer

TAB NAVIGATOR (bottom tabs):
- Projects (home icon)
- New Project (plus icon)
- Settings / Account (user icon)

AUTH GUARD in (app)/_layout.tsx:
- useAuth() hook
- If not authenticated: redirect to (auth)/login
- If authenticated: render tabs

DESIGN SYSTEM:
- Use shared-ui-tokens for all styling
- NativeWind (Tailwind for RN) for utility classes
- Dark mode support from day one
- Safe area handling via expo-safe-area-context

ACCEPTANCE:
- Auth guard works: unauthenticated user lands on login
- Tab navigation works on iOS and Android
- Deep link geenius://billing-success navigates to project settings
- All screens handle loading + error states gracefully


Sub-sprint 6.2 — Project Creation Wizard

TASK: Build the project creation wizard (the core user flow).

FILE: app/(app)/projects/new.tsx

WIZARD STEPS (multi-step form, no page navigation — single screen with steps):

Step 1 — "What are you building?"
- Input: Project name (text field)
- Select: Project type (card selector)
  [Website] [Web App] [Web App + Login & Database] [Web App + AI]
- Each card shows: icon, name, price, key features
- Auto-generate slug preview from name: "my-portfolio" → my-portfolio.geenius.app

Step 2 — "Your subdomain"
- Show: {slug}.geenius.app
- Allow edit slug
- Real-time availability check (debounced, calls GET /projects with slug)
- Green checkmark if available, red X if taken
- Show reserved slug error inline

Step 3 — "Choose your plan" (recap + confirm)
- Summary card: name, subdomain, plan, price/month
- Bullet list of features included in plan
- "Launch Project" CTA button

Step 4 — Billing
- Opens Stripe Checkout via POST /projects/:id/billing/checkout-session
- Uses Expo WebBrowser.openAuthSessionAsync
- Deep link back to app on success

Step 5 — Building... (progress screen)
- Animated progress indicator
- Real-time step display via SSE from GET /jobs/:jobId/logs
- Step labels shown as they complete:
  ✓ Reserving your subdomain
  ✓ Setting up your project
  ✓ Running quality checks
  ✓ Deploying to the web
  ✓ Your site is live!
- "Open your site" button appears on completion

ACCEPTANCE:
- Full wizard flow works end-to-end (may use mocked API in dev)
- Slug availability debounce: 400ms delay, shows spinner
- Step 5 SSE connection closes cleanly on job completion/failure
- Error at any wizard step shows friendly message + "Try again" option
- PostHog tracks: wizard_started, wizard_step_completed (with step number),
  project_created (on success)


Sub-sprint 6.3 — Project Dashboard + Settings

TASK: Build the project detail screen and settings.

PROJECT DASHBOARD (app/(app)/projects/[id]/index.tsx):
- Header: project name + status badge (Live / Building / Suspended)
- Primary URL card: slug.geenius.app with "Open" and "Copy" buttons
- Custom domain card (if active): same buttons
- Quick stats row: plan name, billing period
- Recent activity: last 3 job logs (short)
- Danger zone: "Redeploy" button (confirms before triggering)

PROJECT SETTINGS (app/(app)/projects/[id]/settings.tsx):
Sections (collapsible):
1. Plan & Billing
   - Current plan + price
   - "Upgrade Plan" → shows plan selector → triggers upgrade flow
   - Next billing date
   - "Manage Billing" → Stripe Customer Portal link
2. AI Settings (only visible on AI plan)
   - Model selector: dropdown of AIModel enum values
   - Credits remaining this period: progress bar
   - Credits reset date
3. Danger Zone
   - "Delete Project" → confirmation modal → calls DELETE /projects/:id

DOMAIN MANAGEMENT (app/(app)/projects/[id]/domain.tsx):
- Current domain section:
  - Shows slug.geenius.app (always active)
  - Shows custom domain if any (with status badge)
- "Add Custom Domain" section:
  - Search bar → debounced domain availability check
  - Results: domain name + price + availability indicator
  - "Buy for €X.XX/year" button → triggers Stripe PaymentIntent flow
  - Domain status tracker: Purchased → Configuring → Verifying → Live
    (polls GET /projects/:id/domains every 5s while status is not "active")

LOGS VIEWER (app/(app)/projects/[id]/logs.tsx):
- Shows job_logs for most recent job
- Auto-scroll to bottom
- Level color coding: info=white, warn=yellow, error=red
- Monospace font

ACCEPTANCE:
- "Open" button opens project URL in in-app browser
- Plan upgrade triggers billing flow + shows new plan on success
- Domain search shows results within 1s
- Domain status auto-updates without manual refresh
- Logs auto-scroll and show level colors


SPRINT 7 — Domain Purchase Flow
Sub-sprint 7.1 — Namecheap Integration

TASK: Implement the full Namecheap domain purchase + DNS provisioning flow.

services/namecheap.ts — FULL IMPLEMENTATION:

Base URL: https://api.namecheap.com/xml.response
All calls use: ApiUser, ApiKey, UserName, ClientIp params

checkAvailability(domains: string[]):
  API: namecheap.domains.check
  Returns: Array<{ domain, available, isPremium, price }>
  Max 50 domains per call

getPrice(domain: string):
  API: namecheap.users.getPricing
  command: REGISTER, productType: DOMAIN
  Parse TLD-specific pricing
  Apply formula: max(1000, Math.ceil(registrarCents * 1.30))
  Return: { registrarCents, userPriceCents, userPriceEur }

purchaseDomain(domain: string, years: number = 1):
  API: namecheap.domains.create
  Required contact fields:
    RegistrantFirstName, RegistrantLastName, RegistrantAddress1,
    RegistrantCity, RegistrantPostalCode, RegistrantCountry,
    RegistrantPhone, RegistrantEmailAddress
  Use geenius company contact details for all registrations
  (users never fill in WHOIS — you own the domain on their behalf)
  AddFreeWhoisguard: yes
  WGEnabled: yes
  Returns: { domain, registered: boolean, domainId, orderNum }

setDNStoVercel(domain: string):
  API: namecheap.domains.dns.setHosts
  Set records:
    @ A → 76.76.21.21 (Vercel IP)
    www CNAME → cname.vercel-dns.com
  TTL: 300

getDomainStatus(domain: string):
  API: namecheap.domains.getInfo
  Returns: { status, whoisguard, expires, nameservers }

renewDomain(domain: string):
  API: namecheap.domains.renew
  Returns: { renewed: boolean, expireDate }

FULL ATTACH_DOMAIN JOB (apps/worker/src/steps/attachDomain.ts):
Run as job type "attach_domain" with steps:
1. purchase_domain: call namecheap.purchaseDomain
   - Update domain.registrarDomainId, status=configuring
2. configure_dns: call namecheap.setDNStoVercel
   - Log: "DNS records configured"
3. add_to_vercel: call vercel.addDomain(vercelProjectId, customDomain)
   - Log: "Domain added to Vercel"
4. verify_domain: poll vercel.getDomainVerification every 30s, timeout 30min
   - Log progress: "Verifying SSL certificate... ({elapsed}m)"
   - On verified: update domain.status = "active" in Convex
5. update_project: update project.primaryUrl = custom domain if active

RENEWAL CRON (apps/api/src/jobs/renewalCron.ts):
- Run daily at 02:00 UTC
- Query Convex for domains where renewalDate <= now + 30 days
- For each: charge renewal via Stripe (saved payment method)
  on success: call namecheap.renewDomain, update renewalDate
  on failure: notify user (Sprint 8)

ACCEPTANCE:
- Mock Namecheap API in tests (msw)
- Full attach_domain job completes with mocks
- DNS records are correct (A record + CNAME)
- Domain status updates correctly in Convex throughout flow
- Price floor of €10 is enforced in all test cases


SPRINT 8 — AI Proxy + Credits
Sub-sprint 8.1 — AI Proxy Implementation

TASK: Implement the AI proxy endpoint with credit ledger enforcement.

routes/runtime.ts → POST /runtime/:projectPublicId/ai:

VALIDATION:
1. Load project by publicId → must be "live" status
2. Load project_settings → must have plan === "ai"
3. Load current allowance period → must exist and not expired
4. Check creditsGranted - creditsUsed > 0 → else return 402 with:
   { error: "CREDITS_EXHAUSTED", creditsUsed, creditsGranted, resetAt }

REQUEST BODY:
{
  messages: Array<{ role: "user" | "assistant" | "system", content: string }>,
  model?: AIModel  // defaults to project_settings.aiModel
}

MODEL ROUTING:
- "gpt-4o" | "gpt-4o-mini" → OpenAI API
- "claude-3-5-sonnet" | "claude-3-haiku" → Anthropic API

CREDIT CALCULATION (lib/credits.ts):
const MODEL_CREDIT_RATES: Record<AIModel, { input: number, output: number }> = {
  "gpt-4o":            { input: 5, output: 15 },   // credits per 1K tokens
  "gpt-4o-mini":       { input: 0.15, output: 0.6 },
  "claude-3-5-sonnet": { input: 3, output: 15 },
  "claude-3-haiku":    { input: 0.25, output: 1.25 },
}

function calculateCredits(model, inputTokens, outputTokens): number {
  const rates = MODEL_CREDIT_RATES[model]
  return Math.ceil(
    (inputTokens / 1000 * rates.input) +
    (outputTokens / 1000 * rates.output)
  )
}

EXECUTION FLOW:
1. Validate (above)
2. Call model provider (non-streaming for v1)
3. Parse response: content, usage.input_tokens, usage.output_tokens
4. Calculate credits
5. Atomically deduct via convex.deductCredits(projectId, credits, model, requestId)
   - If deductCredits throws CREDITS_EXHAUSTED (race condition): return 402
6. Return:
   { content: string, model, creditsUsed: number, creditsRemaining: number }

IDEMPOTENCY:
- requestId = hash of (projectPublicId + messages + timestamp)
- Convex deductCredits checks for duplicate requestId to prevent double-billing

RATE LIMITING (per project):
- Max 10 AI requests per minute
- Return 429 with Retry-After header

ACCEPTANCE:
- Credit deduction is atomic (no double-spend under concurrent requests)
- 402 returned when credits exhausted
- 429 returned when rate limit exceeded
- Correct model provider called based on model name
- requestId deduplication prevents double-billing on retry
- Credits tracked correctly across multiple requests
- Unit tests for calculateCredits with known token counts


POST-SPRINT CHECKLIST

Before any sprint is marked "done", verify:

CODE QUALITY:
□ TypeScript strict mode — zero "any" types without comment justification
□ All async functions have try/catch or are wrapped in stepRunner
□ No secrets or API keys in code or logs
□ All Convex queries auth-guarded

TESTING:
□ Unit tests for: validators, credit calculation, price calculation,
  slug validation, idempotency helpers
□ Integration tests (mocked APIs) for: create job, attach_domain job,
  Stripe webhook handlers
□ Test coverage > 70% for services/

OBSERVABILITY:
□ PostHog events fire for all key user actions
□ All job steps log start + completion + duration
□ API errors logged with: route, userId (hashed), error code, duration
□ No PII in any log line

SECURITY:
□ Stripe webhook signature verified before processing
□ All user-supplied slugs validated against SlugSchema before DB write
□ Rate limits in place on: POST /projects (3/hour), AI proxy (10/min)
□ Secrets table values are AES-256 encrypted at rest

MOBILE:
□ Deep links handled for billing-success and billing-cancel
□ App works offline gracefully (shows cached data, disables actions)
□ Expo build succeeds for both iOS and Android targets


Notes for executing these sprints:
Each sprint block is self-contained and executable. Run sprints sequentially — later sprints assume earlier sprints’ types and services are available. Where a service (GitHub, Vercel, Namecheap) is referenced before Sprint 7 implements it fully, use the stub class from Sub-sprint 3.2. All ConvexDB mutations marked “internal only” should be callable only from the API/Worker server — never from the mobile client directly.​​​​​​​​​​​​​​​​
