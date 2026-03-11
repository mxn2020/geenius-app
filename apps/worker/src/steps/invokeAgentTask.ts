import { exec } from "child_process"
import { promisify } from "util"
import type { JobContext } from "../lib/context.js"

const execAsync = promisify(exec)

const IS_PRODUCTION = process.env["NODE_ENV"] === "production"

export async function invokeAgentTask(ctx: JobContext): Promise<void> {
    const project = await ctx.convex.query<{ slug: string; plan: string; name: string; prompt?: string }>(
        "projects:workerGetProject",
        { id: ctx.projectId }
    )
    if (!project) throw new Error("Project not found")

    const org = process.env["GITHUB_ORG"] || "mehdinabhani"
    const repo = `proj-${ctx.projectId}`

    await ctx.log("info", `Invoking Copilot Agent Task for project ${project.slug}...`)

    const userPrompt = project.prompt || `Build me a highly professional ${project.plan} application for ${project.name}, using tailwindcss styling and proper layouts.`

    try {
        const { stdout } = await execAsync(`gh agent-task create --repo ${org}/${repo} "${userPrompt}"`)
        await ctx.log("info", `Agent task delegated successfully: \n${stdout.substring(0, 100)}...`)
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error)

        if (IS_PRODUCTION) {
            // In production, agent task failure should halt the pipeline
            await ctx.log("error", `Agent task invocation failed: ${errMsg}`)
            throw new Error(`Agent task invocation failed: ${errMsg}`)
        }

        // In development, we gracefully skip if the CLI tool isn't available
        await ctx.log("warn", `Agent CLI not available (dev mode): ${errMsg}`)
        await ctx.log("info", "Skipping agent task in development — proceeding to next step")
    }
}
