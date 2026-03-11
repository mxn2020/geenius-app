import type { JobContext } from "../lib/context.js"

type Campaign = {
    _id: string
    resellerId: string
    name: string
    niche: string
    location: string
    totalProspects?: number
}

type DiscoveredProspect = {
    businessName: string
    contactName?: string
    email?: string
    phone?: string
    website?: string
    location: string
    niche: string
    aiSummary?: string
}

/**
 * Runs AI-powered prospect research and bulk-inserts discovered businesses.
 */
export async function aiProspectResearch(ctx: JobContext): Promise<void> {
    await ctx.log("info", "Running AI prospect research...")

    const campaignId = (ctx.meta?.["campaignId"] as string) ?? ""
    if (!campaignId) {
        await ctx.log("warn", "No campaignId in job metadata — skipping prospect research")
        return
    }

    // Fetch campaign details
    const campaign = await ctx.convex.query<Campaign | null>(
        "campaigns:getCampaign",
        { id: campaignId }
    )
    if (!campaign) throw new Error(`Campaign not found: ${campaignId}`)

    await ctx.log("info", `Researching prospects for niche "${campaign.niche}" in "${campaign.location}"`)

    // Call AI research service via the API
    const apiUrl = process.env["API_URL"] ?? "http://localhost:3000"
    let prospects: DiscoveredProspect[] = []

    try {
        const res = await fetch(`${apiUrl}/reseller/research`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                niche: campaign.niche,
                location: campaign.location,
                maxResults: 50,
            }),
        })

        if (!res.ok) {
            throw new Error(`AI research API returned ${res.status}`)
        }

        const data = (await res.json()) as { prospects: DiscoveredProspect[]; count: number }
        prospects = data.prospects
        await ctx.log("info", `AI research found ${data.count} prospects`)
    } catch (err) {
        await ctx.log("warn", `AI research failed: ${err instanceof Error ? err.message : String(err)}. Using empty results.`)
        prospects = []
    }

    if (prospects.length === 0) {
        await ctx.log("info", "No prospects discovered — skipping bulk insert")
        return
    }

    // Bulk-insert prospects into Convex
    let insertedCount = 0
    for (const prospect of prospects) {
        try {
            const prospectId = await ctx.convex.mutation<string>("prospects:workerCreateProspect", {
                resellerId: campaign.resellerId,
                businessName: prospect.businessName,
                contactName: prospect.contactName,
                email: prospect.email,
                phone: prospect.phone,
                website: prospect.website,
                location: prospect.location ?? campaign.location,
                niche: prospect.niche ?? campaign.niche,
                status: "new",
                aiSummary: prospect.aiSummary,
            })

            // Queue a campaign email for each prospect with an email
            if (prospect.email) {
                await ctx.convex.mutation("campaigns:queueEmail", {
                    campaignId,
                    prospectId,
                    status: "queued",
                })
            }

            insertedCount++
        } catch (err) {
            await ctx.log("warn", `Failed to insert prospect "${prospect.businessName}": ${err instanceof Error ? err.message : String(err)}`)
        }
    }

    // Update campaign total prospects count
    await ctx.convex.mutation("campaigns:workerUpdateCampaign", {
        id: campaignId,
        totalProspects: (campaign.totalProspects ?? 0) + insertedCount,
    })

    await ctx.log("info", `AI prospect research completed: ${insertedCount} prospects inserted, emails queued`)
}
