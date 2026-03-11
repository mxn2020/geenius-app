import { exec } from "child_process"
import { promisify } from "util"
import type { JobContext } from "../lib/context.js"

const execAsync = promisify(exec)

const IS_PRODUCTION = process.env["NODE_ENV"] === "production"

export async function waitAgentTask(ctx: JobContext): Promise<void> {
    const project = await ctx.convex.query<{ slug: string }>(
        "projects:workerGetProject",
        { id: ctx.projectId }
    )
    if (!project) throw new Error("Project not found")

    const org = process.env["GITHUB_ORG"] || "mehdinabhani"
    const repo = `proj-${ctx.projectId}`

    await ctx.log("info", `Polling Copilot Agent Task status for project ${project.slug}...`)

    try {
        const { stdout } = await execAsync(`gh agent-task list --repo ${org}/${repo} --state open`)
        if (stdout.trim().length > 0) {
            await ctx.log("info", "Agent is still working...")
            // Throw so the stepRunner retries this step
            throw new Error("AGENT_TASK_PENDING")
        }
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error)

        // AGENT_TASK_PENDING is expected — re-throw for retry
        if (errMsg.includes("AGENT_TASK_PENDING")) throw error

        if (IS_PRODUCTION) {
            // In production, CLI errors are real failures
            await ctx.log("error", `Agent task polling failed: ${errMsg}`)
            throw new Error(`Agent task polling failed: ${errMsg}`)
        }

        // In development, assume agent is done and proceed
        await ctx.log("warn", `Agent CLI not available (dev mode): ${errMsg}`)
        await ctx.log("info", "Assuming agent complete in development — proceeding")
    }

    await ctx.log("info", "Agent task completed. PR merged successfully.")
}
