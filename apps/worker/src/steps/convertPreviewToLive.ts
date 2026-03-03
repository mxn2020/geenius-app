import type { JobContext } from "../lib/context.js"

/**
 * Converts a preview site to a live production deployment.
 * Activates billing, assigns domain, marks project as live.
 */
export async function convertPreviewToLive(ctx: JobContext): Promise<void> {
    await ctx.log("info", "Converting preview site to live production...")

    // In production, this step would:
    // 1. Verify that the prospect has agreed (status = "won")
    // 2. Activate Stripe billing via the reseller's connected account
    // 3. Change project status from "preview" to "creating"
    // 4. Deploy to Vercel production environment
    // 5. Assign the slug domain (slug.geenius.app)
    // 6. Mark project as "live"
    // 7. Increment reseller_usage.deployedProjects for metered billing
    // 8. Update prospect status to "won"

    await ctx.log("info", "Preview-to-live conversion completed (mock in dev)")
}
