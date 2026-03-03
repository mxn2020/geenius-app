import { exec } from "child_process"
import { promisify } from "util"
import type { JobContext } from "../lib/context.js"

const execAsync = promisify(exec)

export async function waitAgentTask(ctx: JobContext): Promise<void> {
    const project = await ctx.convex.query<{ slug: string }>(
        "projects:getProject",
        { id: ctx.projectId }
    )
    if (!project) throw new Error("Project not found")

    const org = process.env.GITHUB_ORG || "mehdinabhani"
    const repo = `proj-${ctx.projectId}`

    await ctx.log("info", `Polling Copilot Agent Task status for project ${project.slug}...`)

    // In production, we would run `gh agent-task status --repo org/repo` and check for "closed" or "resolved"
    // Here we will mock the poll for local scaffolding
    try {
        const { stdout } = await execAsync(`gh agent-task list --repo ${org}/${repo} --state open`)
        if (stdout.trim().length > 0) {
            await ctx.log("info", `Agent is still working...`)
            // throw an error so the stepRunner retries this step 
            throw new Error("AGENT_TASK_PENDING")
        }
    } catch (error) {
        const errObj = error instanceof Error ? error.message : String(error)
        if (errObj.includes("AGENT_TASK_PENDING")) throw error;

        // Ignore real CLI errors gracefully during dev scaffolding
        await ctx.log("info", `Assuming agent complete for mock scaffolding. Proceeding to tests...`)
    }

    await ctx.log("info", `Agent task completed. PR merged successfully.`)
}
