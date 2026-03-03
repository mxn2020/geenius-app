import { exec } from "child_process"
import { promisify } from "util"
import type { JobContext } from "../lib/context.js"

const execAsync = promisify(exec)

export async function invokeAgentTask(ctx: JobContext): Promise<void> {
    const project = await ctx.convex.query<{ slug: string; plan: string; name: string; prompt?: string }>(
        "projects:getProject",
        { id: ctx.projectId }
    )
    if (!project) throw new Error("Project not found")

    const org = process.env.GITHUB_ORG || "mehdinabhani" // Fallback to current user
    const repo = `proj-${ctx.projectId}`

    await ctx.log("info", `Invoking Copilot Agent Task for project ${project.slug}...`)

    const userPrompt = project.prompt || `Build me a highly professional ${project.plan} application for ${project.name}, using tailwindcss styling and proper layouts.`

    // Call the gh-agent-task CLI extension (or gh issue create with specific labels/app integrations)
    try {
        const { stdout } = await execAsync(`gh agent-task create --repo ${org}/${repo} "${userPrompt}"`)
        await ctx.log("info", `Agent task delegated successfully: \n${stdout.substring(0, 100)}...`)
    } catch (error) {
        const errObj = error instanceof Error ? error.message : String(error)
        await ctx.log("warn", `Agent CLI failed (normal during local mock): ${errObj}`)
        // If the tool isn't installed locally, we just mock the success so the job can proceed
    }
}
