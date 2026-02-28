import { ConvexHttpClient } from "convex/browser"
import type { JobContext } from "./lib/context.js"
import { runStep } from "./lib/stepRunner.js"
import { reserveSlug } from "./steps/reserveSlug.js"
import { createGithubRepo } from "./steps/createGithubRepo.js"
import { pushTemplate } from "./steps/pushTemplate.js"
import { applyModules } from "./steps/applyModules.js"
import { commitChanges } from "./steps/commitChanges.js"
import { triggerCI } from "./steps/triggerCI.js"
import { waitCI } from "./steps/waitCI.js"
import { createVercelProject } from "./steps/createVercelProject.js"
import { setEnvVars } from "./steps/setEnvVars.js"
import { deploy } from "./steps/deploy.js"
import { assignSlugDomain } from "./steps/assignSlugDomain.js"
import { verifyLive } from "./steps/verifyLive.js"
import { markLive } from "./steps/markLive.js"

type Step = { name: string; fn: (ctx: JobContext) => Promise<void>; retryable?: boolean }

const CREATE_STEPS: Step[] = [
  { name: "reserve_slug", fn: reserveSlug, retryable: false },
  { name: "create_github_repo", fn: createGithubRepo },
  { name: "push_template", fn: pushTemplate },
  { name: "apply_modules", fn: applyModules },
  { name: "commit_changes", fn: commitChanges },
  { name: "trigger_ci", fn: triggerCI },
  { name: "wait_ci", fn: waitCI, retryable: false },
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
  { name: "apply_modules", fn: applyModules },
  { name: "commit_changes", fn: commitChanges },
  { name: "trigger_ci", fn: triggerCI },
  { name: "wait_ci", fn: waitCI, retryable: false },
  { name: "deploy", fn: deploy, retryable: false },
  { name: "verify_live", fn: verifyLive, retryable: false },
  { name: "mark_live", fn: markLive },
]

function getSteps(jobType: string): Step[] {
  switch (jobType) {
    case "create": return CREATE_STEPS
    case "redeploy": return REDEPLOY_STEPS
    case "upgrade": return UPGRADE_STEPS
    default: return CREATE_STEPS
  }
}

export async function runJob(
  jobId: string,
  jobType: string,
  projectId: string,
  convexUrl: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawConvex = new ConvexHttpClient(convexUrl)

  const ctx: JobContext = {
    jobId,
    projectId,
    jobType,
    log: async (level, message) => {
      console.log(`[${level.toUpperCase()}] [job:${jobId}] ${message}`)
      await rawConvex.mutation("jobs:appendJobLog" as Parameters<typeof rawConvex.mutation>[0], {
        jobId,
        level,
        message,
      })
    },
    convex: {
      query: async <T>(fn: string, args: Record<string, unknown>) => {
        return rawConvex.query(fn as Parameters<typeof rawConvex.query>[0], args) as Promise<T>
      },
      mutation: async <T>(fn: string, args: Record<string, unknown>) => {
        return rawConvex.mutation(fn as Parameters<typeof rawConvex.mutation>[0], args) as Promise<T>
      },
    },
  }

  await rawConvex.mutation("jobs:updateJob" as Parameters<typeof rawConvex.mutation>[0], {
    id: jobId,
    state: "running",
  })

  try {
    const steps = getSteps(jobType)
    for (const step of steps) {
      await runStep(ctx, step.name, () => step.fn(ctx), { retryable: step.retryable ?? true })
    }

    await rawConvex.mutation("jobs:updateJob" as Parameters<typeof rawConvex.mutation>[0], {
      id: jobId,
      state: "done",
    })
    await ctx.log("info", `Job ${jobId} completed successfully`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await ctx.log("error", `Job ${jobId} failed: ${message}`)
    await rawConvex.mutation("jobs:updateJob" as Parameters<typeof rawConvex.mutation>[0], {
      id: jobId,
      state: "failed",
      error: message,
    })
    throw err
  }
}
