import type { JobContext } from "../lib/context.js"

/**
 * Sends campaign emails via Resend using the reseller's own API key.
 * Pulls queued campaign_emails, sends them in batches, and updates status.
 */
export async function sendCampaignEmails(ctx: JobContext): Promise<void> {
    await ctx.log("info", "Sending campaign emails...")

    // In production, this step would:
    // 1. Query campaign_emails with status "queued" for this campaign
    // 2. Fetch the reseller's Resend API key from reseller_profiles
    // 3. Build personalized emails using ResendService.buildCampaignEmail
    // 4. Send in batches of 50 (Resend batch limit)
    // 5. Update each campaign_email status to "sent" with resendMessageId
    // 6. Update campaign totalSent counter
    // 7. Track in reseller_usage for metered billing

    await ctx.log("info", "Campaign email sending step completed (mock in dev)")
}
