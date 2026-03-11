import type { JobContext } from "../lib/context.js"

const BATCH_SIZE = 50 // Resend recommends max 100 per batch, we use 50

type CampaignEmail = {
    _id: string
    campaignId: string
    prospectId: string
    status: string
}

type Prospect = {
    _id: string
    businessName: string
    contactName?: string
    email?: string
}

type Campaign = {
    _id: string
    resellerId: string
    name: string
    templateSubject: string
    templateBody: string
    totalSent?: number
}

type ResellerProfile = {
    companyName: string
    resendApiKey?: string
    emailFromName?: string
    emailFromDomain?: string
}

export async function sendCampaignEmails(ctx: JobContext): Promise<void> {
    await ctx.log("info", "Querying queued campaign emails...")

    // Get the campaign from job metadata or project
    const campaignId = (ctx.meta?.["campaignId"] as string) ?? ""
    if (!campaignId) {
        await ctx.log("warn", "No campaignId in job metadata — skipping email send")
        return
    }

    // Fetch campaign details
    const campaign = await ctx.convex.query<Campaign | null>(
        "campaigns:getCampaign",
        { id: campaignId }
    )
    if (!campaign) throw new Error(`Campaign not found: ${campaignId}`)

    // Fetch reseller profile for API key and sender info
    const resellerProfile = await ctx.convex.query<ResellerProfile | null>(
        "resellers:workerGetProfile",
        { userId: campaign.resellerId }
    )
    if (!resellerProfile) throw new Error("Reseller profile not found")
    if (!resellerProfile.resendApiKey) {
        await ctx.log("warn", "Reseller has no Resend API key configured — skipping email send")
        return
    }

    // Get queued emails for this campaign
    const queuedEmails = await ctx.convex.query<CampaignEmail[]>(
        "campaigns:getQueuedEmails",
        { campaignId }
    )
    if (!queuedEmails || queuedEmails.length === 0) {
        await ctx.log("info", "No queued emails to send")
        return
    }

    await ctx.log("info", `Found ${queuedEmails.length} queued emails to send`)

    let totalSent = 0
    const senderName = resellerProfile.emailFromName ?? resellerProfile.companyName
    const senderDomain = resellerProfile.emailFromDomain ?? "geenius.dev"

    // Process in batches
    for (let i = 0; i < queuedEmails.length; i += BATCH_SIZE) {
        const batch = queuedEmails.slice(i, i + BATCH_SIZE)
        const emailPromises: Promise<void>[] = []

        for (const email of batch) {
            const promise = (async () => {
                // Fetch prospect details for personalization
                const prospect = await ctx.convex.query<Prospect | null>(
                    "prospects:getProspect",
                    { id: email.prospectId }
                )
                if (!prospect || !prospect.email) {
                    await ctx.convex.mutation("campaigns:workerUpdateEmailStatus", {
                        id: email._id,
                        status: "failed",
                    })
                    return
                }

                try {
                    // Build personalized email
                    const personalizedSubject = campaign.templateSubject
                        .replace(/\{\{prospect_name\}\}/g, prospect.contactName ?? prospect.businessName)
                        .replace(/\{\{company_name\}\}/g, prospect.businessName)

                    const personalizedBody = campaign.templateBody
                        .replace(/\{\{prospect_name\}\}/g, prospect.contactName ?? prospect.businessName)
                        .replace(/\{\{company_name\}\}/g, prospect.businessName)

                    const html = `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
              ${personalizedBody}
              <hr style="margin-top: 2rem; border: none; border-top: 1px solid #e5e7eb;" />
              <p style="font-size: 12px; color: #6b7280;">
                ${resellerProfile.companyName}<br/>
                <a href="https://geenius.dev/unsubscribe" style="color: #6366f1;">Unsubscribe</a>
              </p>
            </div>
          `

                    // Send email via Resend API directly (no service dependency needed)
                    const res = await fetch("https://api.resend.com/emails", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${resellerProfile.resendApiKey}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            from: `${senderName} <noreply@${senderDomain}>`,
                            to: prospect.email,
                            subject: personalizedSubject,
                            html,
                            tags: [
                                { name: "campaign", value: campaign.name },
                                { name: "prospect", value: prospect.businessName },
                            ],
                        }),
                    })

                    if (!res.ok) {
                        const errBody = await res.text()
                        throw new Error(`Resend API error ${res.status}: ${errBody}`)
                    }

                    const result = (await res.json()) as { id: string }

                    // Update email status to sent
                    await ctx.convex.mutation("campaigns:workerUpdateEmailStatus", {
                        id: email._id,
                        status: "sent",
                        sentAt: Date.now(),
                        resendMessageId: result.id,
                    })
                    totalSent++
                } catch (err) {
                    await ctx.log("warn", `Failed to send email to ${prospect.email}: ${err instanceof Error ? err.message : String(err)}`)
                    await ctx.convex.mutation("campaigns:workerUpdateEmailStatus", {
                        id: email._id,
                        status: "failed",
                    })
                }
            })()
            emailPromises.push(promise)
        }

        await Promise.all(emailPromises)
        await ctx.log("info", `Batch ${Math.floor(i / BATCH_SIZE) + 1} complete — ${totalSent} sent so far`)
    }

    // Update campaign totals
    await ctx.convex.mutation("campaigns:workerUpdateCampaign", {
        id: campaignId,
        totalSent: (campaign.totalSent ?? 0) + totalSent,
    })

    await ctx.log("info", `Campaign email send completed: ${totalSent}/${queuedEmails.length} emails sent`)
}
