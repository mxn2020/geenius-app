import type { JobContext } from "../lib/context.js"

/**
 * Runs AI-powered prospect research and bulk-inserts discovered businesses.
 */
export async function aiProspectResearch(ctx: JobContext): Promise<void> {
    await ctx.log("info", "Running AI prospect research...")

    // In production, this step would:
    // 1. Read the campaign's niche + location parameters
    // 2. Call AIResearchService.discoverProspects()
    // 3. Bulk-insert discovered prospects via prospects:bulkCreate
    // 4. Link prospects to the campaign
    // 5. Queue campaign_emails for each discovered prospect
    // 6. Update campaign totalProspects counter

    await ctx.log("info", "AI prospect research completed (mock in dev)")
}
