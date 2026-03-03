import { Hono } from "hono"
import { AIResearchService } from "../services/aiResearch.js"
import { env } from "../env.js"

const reseller = new Hono()

// ─── AI Prospect Research ────────────────────────────
reseller.post("/research", async (c) => {
    const body = await c.req.json() as {
        niche: string
        location: string
        maxResults?: number
    }

    if (!body.niche || !body.location) {
        return c.json({ error: "niche and location are required" }, 400)
    }

    const service = new AIResearchService(
        env.GOOGLE_PLACES_API_KEY ?? "",
        env.ANTHROPIC_API_KEY ?? ""
    )

    try {
        const prospects = await service.discoverProspects({
            niche: body.niche,
            location: body.location,
            maxResults: body.maxResults,
        })
        return c.json({ prospects, count: prospects.length })
    } catch (error) {
        return c.json({ error: "Research failed", details: String(error) }, 500)
    }
})

// ─── Generate Preview Site ───────────────────────────
reseller.post("/preview", async (c) => {
    const body = await c.req.json() as {
        prospectId: string
        resellerId: string
        name: string
        slug: string
        plan: string
        prompt: string
    }

    if (!body.prospectId || !body.name || !body.slug) {
        return c.json({ error: "prospectId, name, and slug are required" }, 400)
    }

    // Dispatch a preview job to the worker
    try {
        const workerUrl = env.WORKER_QUEUE_URL ?? "http://localhost:3005"
        const res = await fetch(`${workerUrl}/jobs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jobId: `preview-${Date.now()}`,
                type: "preview",
                projectId: body.prospectId, // Will be mapped to project after creation
                meta: {
                    name: body.name,
                    slug: body.slug,
                    plan: body.plan || "website",
                    prompt: body.prompt,
                    resellerId: body.resellerId,
                    prospectId: body.prospectId,
                },
            }),
        })
        const result = await res.json()
        return c.json({ ok: true, ...result }, 202)
    } catch (error) {
        return c.json({ error: "Failed to dispatch preview job", details: String(error) }, 500)
    }
})

// ─── Convert Preview → Live ─────────────────────────
reseller.post("/convert", async (c) => {
    const body = await c.req.json() as {
        projectId: string
        prospectId: string
    }

    if (!body.projectId) {
        return c.json({ error: "projectId is required" }, 400)
    }

    try {
        const workerUrl = env.WORKER_QUEUE_URL ?? "http://localhost:3005"
        const res = await fetch(`${workerUrl}/jobs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jobId: `convert-${Date.now()}`,
                type: "convert",
                projectId: body.projectId,
            }),
        })
        const result = await res.json()
        return c.json({ ok: true, ...result }, 202)
    } catch (error) {
        return c.json({ error: "Failed to dispatch convert job", details: String(error) }, 500)
    }
})

// ─── Compliance Rules ────────────────────────────────
reseller.get("/compliance/:market", async (c) => {
    const market = c.req.param("market")
    const validMarkets = ["EU", "US", "UK", "DACH"]
    if (!validMarkets.includes(market)) {
        return c.json({ error: `Invalid market. Valid: ${validMarkets.join(", ")}` }, 400)
    }

    // Legal warnings shown to the user
    const warnings: Record<string, string> = {
        EU: "⚠️ GDPR requires explicit opt-in consent before sending marketing emails. Sending without consent can result in fines up to €20M or 4% of annual revenue.",
        US: "⚠️ CAN-SPAM requires a physical address and opt-out mechanism in every commercial email. Violations can incur penalties of $50,120 per email.",
        UK: "⚠️ PECR requires consent for unsolicited marketing. The ICO can issue fines up to £500,000 for violations.",
        DACH: "⚠️ UWG §7 strictly prohibits cold B2C emails. Even B2B cold email is highly risky under German law. Double opt-in is strongly recommended.",
    }

    return c.json({
        market,
        warning: warnings[market],
        message: "Review full compliance rules via the Convex compliance:getRulesForMarket query.",
    })
})

export default reseller
