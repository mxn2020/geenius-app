import { ConvexHttpClient } from "convex/browser"
import type { JobContext } from "./lib/context.js"
import { runStep } from "./lib/stepRunner.js"
import {
  createGitHubService,
  createVercelService,
  createNamecheapService,
} from "./lib/services.js"
import { reserveSlug } from "./steps/reserveSlug.js"
import { createGithubRepo } from "./steps/createGithubRepo.js"
import { pushTemplate } from "./steps/pushTemplate.js"
import { createVercelProject } from "./steps/createVercelProject.js"
import { setEnvVars } from "./steps/setEnvVars.js"
import { deploy } from "./steps/deploy.js"
import { assignSlugDomain } from "./steps/assignSlugDomain.js"
import { verifyLive } from "./steps/verifyLive.js"
import { markLive } from "./steps/markLive.js"
import { invokeAgentTask } from "./steps/invokeAgentTask.js"
import { waitAgentTask } from "./steps/waitAgentTask.js"
import {
  purchaseDomainStep,
  configureDNSStep,
  addToVercelStep,
  verifyDomainStep,
  updateProjectDomainStep,
} from "./steps/attachDomain.js"
import { sendCampaignEmails } from "./steps/sendCampaignEmails.js"
import { generatePreviewSite } from "./steps/generatePreviewSite.js"
import { convertPreviewToLive } from "./steps/convertPreviewToLive.js"
import { aiProspectResearch } from "./steps/aiProspectResearch.js"

type Step = { name: string; fn: (ctx: JobContext) => Promise<void>; retryable?: boolean }

const CREATE_STEPS: Step[] = [
  { name: "reserve_slug", fn: reserveSlug, retryable: false },
  { name: "create_github_repo", fn: createGithubRepo },
  { name: "push_template", fn: pushTemplate },
  { name: "invoke_agent_task", fn: invokeAgentTask },
  { name: "wait_agent_task", fn: waitAgentTask, retryable: true },
  { name: "create_vercel_project", fn: createVercelProject },
  { name: "set_env_vars", fn: setEnvVars },
  { name: "deploy", fn: deploy, retryable: false },
  { name: "assign_slug_domain", fn: assignSlugDomain },
  { name: "verify_live", fn: verifyLive, retryable: false },
  { name: "mark_live", fn: markLive },
]

const REDEPLOY_STEPS: Step[] = [
  { name: "deploy", fn: deploy, retryable: false },
  { name: "verify_live", fn: verifyLive, retryable: false },
  { name: "mark_live", fn: markLive },
]

const UPGRADE_STEPS: Step[] = [
  { name: "invoke_agent_task", fn: invokeAgentTask },
  { name: "wait_agent_task", fn: waitAgentTask, retryable: true },
  { name: "deploy", fn: deploy, retryable: false },
  { name: "verify_live", fn: verifyLive, retryable: false },
  { name: "mark_live", fn: markLive },
]

const ATTACH_DOMAIN_STEPS: Step[] = [
  { name: "purchase_domain", fn: purchaseDomainStep },
  { name: "configure_dns", fn: configureDNSStep },
  { name: "add_to_vercel", fn: addToVercelStep },
  { name: "verify_domain", fn: verifyDomainStep, retryable: false },
  { name: "update_project_domain", fn: updateProjectDomainStep },
]

const PREVIEW_STEPS: Step[] = [
  { name: "reserve_slug", fn: reserveSlug, retryable: false },
  { name: "create_github_repo", fn: createGithubRepo },
  { name: "push_template", fn: pushTemplate },
  { name: "generate_preview_site", fn: generatePreviewSite },
]

const CONVERT_STEPS: Step[] = [
  { name: "convert_preview_to_live", fn: convertPreviewToLive },
  { name: "deploy", fn: deploy, retryable: false },
  { name: "assign_slug_domain", fn: assignSlugDomain },
  { name: "verify_live", fn: verifyLive, retryable: false },
  { name: "mark_live", fn: markLive },
]

const CAMPAIGN_STEPS: Step[] = [
  { name: "ai_prospect_research", fn: aiProspectResearch },
  { name: "send_campaign_emails", fn: sendCampaignEmails },
]

function getSteps(jobType: string): Step[] {
  switch (jobType) {
    case "create": return CREATE_STEPS
    case "redeploy": return REDEPLOY_STEPS
    case "upgrade": return UPGRADE_STEPS
    case "attach_domain": return ATTACH_DOMAIN_STEPS
    case "preview": return PREVIEW_STEPS
    case "convert": return CONVERT_STEPS
    case "campaign_send": return CAMPAIGN_STEPS
    default: return CREATE_STEPS
  }
}

export async function runJob(
  jobId: string,
  jobType: string,
  projectId: string,
  convexUrl: string,
  meta?: Record<string, unknown>
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawConvex = new ConvexHttpClient(convexUrl)

  // Create service instances from environment variables
  const github = createGitHubService(
    process.env["GITHUB_ORG"],
    process.env["GITHUB_APP_ID"],
    process.env["GITHUB_APP_PRIVATE_KEY"]
  )
  const vercel = createVercelService(
    process.env["VERCEL_API_TOKEN"],
    process.env["VERCEL_TEAM_ID"]
  )
  const namecheap = createNamecheapService(
    process.env["NAMECHEAP_API_USER"],
    process.env["NAMECHEAP_API_KEY"],
    process.env["NAMECHEAP_CLIENT_IP"]
  )

  const ctx: JobContext = {
    jobId,
    projectId,
    jobType,
    meta,
    log: async (level, message) => {
      console.log(`[${level.toUpperCase()}] [job:${jobId}] ${message}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await rawConvex.mutation("jobs:appendJobLog" as any, {
        jobId,
        level,
        message,
      })
    },
    convex: {
      query: async <T>(fn: string, args: Record<string, unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawConvex.query(fn as any, args) as Promise<T>
      },
      mutation: async <T>(fn: string, args: Record<string, unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return rawConvex.mutation(fn as any, args) as Promise<T>
      },
    },
    github,
    vercel,
    namecheap,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await rawConvex.mutation("jobs:updateJob" as any, {
    id: jobId,
    state: "running",
  })

  try {
    const steps = getSteps(jobType)
    for (const step of steps) {
      await runStep(ctx, step.name, () => step.fn(ctx), { retryable: step.retryable ?? true })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await rawConvex.mutation("jobs:updateJob" as any, {
      id: jobId,
      state: "done",
    })
    await ctx.log("info", `Job ${jobId} completed successfully`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await ctx.log("error", `Job ${jobId} failed: ${message}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await rawConvex.mutation("jobs:updateJob" as any, {
      id: jobId,
      state: "failed",
      error: message,
    })
    throw err
  }
}

