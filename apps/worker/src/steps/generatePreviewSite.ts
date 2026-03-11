import type { JobContext } from "../lib/context.js"

/**
 * Generates a preview site for a prospect.
 * This creates the project, pushes template, and deploys to a preview URL.
 */
export async function generatePreviewSite(ctx: JobContext): Promise<void> {
    const project = await ctx.convex.query<{
        slug: string
        plan: string
        name: string
        prompt?: string
        prospectId?: string
        vercelProjectId?: string
    }>("projects:workerGetProject", { id: ctx.projectId })
    if (!project) throw new Error("Project not found")

    await ctx.log("info", `Generating preview site for project "${project.name}" (${project.slug})`)

    // The preview pipeline context already creates the repo and pushes the template
    // via the PREVIEW_STEPS pipeline (reserve_slug → create_github_repo → push_template → generate_preview_site).
    // This step handles the deployment part.

    if (!ctx.vercel) {
        await ctx.log("warn", "Vercel service not configured — skipping preview deployment")
        return
    }

    // Create Vercel project if not already created
    if (!project.vercelProjectId) {
        const org = process.env["GITHUB_ORG"] ?? ""
        const repoName = `proj-${ctx.projectId}`

        await ctx.log("info", `Creating Vercel project for preview: ${project.slug}`)
        const vercelProject = await ctx.vercel.createProject(
            `preview-${project.slug}`,
            `${org}/${repoName}`,
            [
                { key: "NEXT_PUBLIC_PROJECT_SLUG", value: project.slug, target: ["production", "preview"], type: "plain" },
                { key: "NEXT_PUBLIC_PLAN", value: project.plan, target: ["production", "preview"], type: "plain" },
            ]
        )

        await ctx.convex.mutation("projects:updateProject", {
            id: ctx.projectId,
            vercelProjectId: vercelProject.id,
            status: "preview",
        })

        await ctx.log("info", `Vercel preview project created: ${vercelProject.id}`)
    }

    // Trigger deployment
    const vercelProjectId = project.vercelProjectId ?? `preview-${project.slug}`
    await ctx.log("info", "Triggering preview deployment...")
    const deployment = await ctx.vercel.triggerDeploy(vercelProjectId)

    // Poll for deployment completion
    const deadline = Date.now() + 5 * 60 * 1000 // 5 min timeout for preview
    while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 10_000))
        const status = await ctx.vercel.getDeploymentStatus(deployment.id)
        await ctx.log("info", `Preview deployment status: ${status.readyState}`)

        if (status.readyState === "READY") {
            const previewUrl = `https://${status.url}`
            await ctx.convex.mutation("projects:updateProject", {
                id: ctx.projectId,
                primaryUrl: previewUrl,
            })
            await ctx.log("info", `Preview site live: ${previewUrl}`)

            // Link preview to prospect if applicable
            if (project.prospectId) {
                await ctx.convex.mutation("prospects:workerUpdateProspect", {
                    id: project.prospectId,
                    previewProjectId: ctx.projectId,
                })
            }
            return
        }
        if (status.readyState === "ERROR" || status.readyState === "CANCELED") {
            throw new Error(`Preview deployment ended with state: ${status.readyState}`)
        }
    }

    throw new Error("Preview deployment timed out")
}
