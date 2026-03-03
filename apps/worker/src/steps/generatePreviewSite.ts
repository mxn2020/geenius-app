import type { JobContext } from "../lib/context.js"

/**
 * Generates a preview site for a prospect.
 * Clones a template, runs the AI agent to customize it, deploys as preview.
 */
export async function generatePreviewSite(ctx: JobContext): Promise<void> {
    await ctx.log("info", "Generating preview site for prospect...")

    // In production, this step would:
    // 1. Create a new project record with status "preview"
    // 2. Clone the appropriate template based on plan
    // 3. Run gh agent-task with the prospect's niche-specific prompt
    // 4. Deploy to Vercel as a preview (not production)
    // 5. Link the preview project to the prospect record
    // 6. Update prospect with previewProjectId

    await ctx.log("info", "Preview site generation completed (mock in dev)")
}
