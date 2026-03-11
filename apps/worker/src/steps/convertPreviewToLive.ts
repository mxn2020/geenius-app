import type { JobContext } from "../lib/context.js"

/**
 * Converts a preview site to a live production site.
 * This step validates the prospect status and transitions the project,
 * then the remaining CONVERT_STEPS (deploy, assign_slug_domain, verify_live, mark_live)
 * handle the actual deployment.
 */
export async function convertPreviewToLive(ctx: JobContext): Promise<void> {
    const project = await ctx.convex.query<{
        slug: string
        plan: string
        name: string
        status: string
        prospectId?: string
        vercelProjectId?: string
    }>("projects:workerGetProject", { id: ctx.projectId })
    if (!project) throw new Error("Project not found")

    await ctx.log("info", `Converting preview to live for project "${project.name}" (${project.slug})`)

    // Validate project is in preview state
    if (project.status !== "preview" && project.status !== "creating") {
        await ctx.log("warn", `Project is in "${project.status}" state — expected "preview" or "creating"`)
    }

    // If linked to a prospect, verify the prospect status
    if (project.prospectId) {
        const prospect = await ctx.convex.query<{ status: string; businessName: string } | null>(
            "prospects:getProspect",
            { id: project.prospectId }
        )
        if (prospect) {
            await ctx.log("info", `Prospect "${prospect.businessName}" status: ${prospect.status}`)
            // Update prospect status to "won" since they're converting
            if (prospect.status !== "won") {
                await ctx.convex.mutation("prospects:workerUpdateProspect", {
                    id: project.prospectId,
                    status: "won",
                })
                await ctx.log("info", `Updated prospect status to "won"`)
            }
        }
    }

    // Transition project from preview → creating (the deploy step will set it to live)
    await ctx.convex.mutation("projects:updateProject", {
        id: ctx.projectId,
        status: "creating",
    })

    await ctx.log("info", "Project transitioned to 'creating' — deployment pipeline will continue")
}
