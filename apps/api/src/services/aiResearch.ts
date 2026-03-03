/**
 * AI Research Service
 * Uses web APIs + AI to discover and enrich business prospects by niche + location.
 */

export interface ResearchRequest {
    niche: string
    location: string
    maxResults?: number
}

export interface DiscoveredProspect {
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
 * Discovers businesses using Google Places API (or mock) and enriches with AI.
 */
export class AIResearchService {
    private googleApiKey: string
    private anthropicApiKey: string

    constructor(googleApiKey: string, anthropicApiKey: string) {
        this.googleApiKey = googleApiKey
        this.anthropicApiKey = anthropicApiKey
    }

    async discoverProspects(request: ResearchRequest): Promise<DiscoveredProspect[]> {
        const maxResults = request.maxResults ?? 20
        const places = await this.searchGooglePlaces(request.niche, request.location, maxResults)
        const enriched = await this.enrichWithAI(places, request.niche)
        return enriched
    }

    private async searchGooglePlaces(
        niche: string,
        location: string,
        maxResults: number
    ): Promise<DiscoveredProspect[]> {
        // Google Places Text Search API
        const query = encodeURIComponent(`${niche} in ${location}`)
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${this.googleApiKey}`

        try {
            const res = await fetch(url)
            const data = (await res.json()) as {
                results?: Array<{
                    name: string
                    formatted_address: string
                    place_id: string
                }>
            }

            if (!data.results) return []

            const prospects: DiscoveredProspect[] = data.results
                .slice(0, maxResults)
                .map((place) => ({
                    businessName: place.name,
                    location: place.formatted_address || location,
                    niche,
                }))

            // Get details (phone, website) for each place
            for (const prospect of prospects) {
                const placeResult = data.results?.find((r) => r.name === prospect.businessName)
                if (placeResult) {
                    const details = await this.getPlaceDetails(placeResult.place_id)
                    if (details) {
                        prospect.phone = details.phone
                        prospect.website = details.website
                    }
                }
            }

            return prospects
        } catch (error) {
            console.error("[AIResearch] Google Places API failed:", error)
            // Return mock data in development
            return this.getMockProspects(niche, location, maxResults)
        }
    }

    private async getPlaceDetails(
        placeId: string
    ): Promise<{ phone?: string; website?: string } | null> {
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website&key=${this.googleApiKey}`
        try {
            const res = await fetch(url)
            const data = (await res.json()) as {
                result?: { formatted_phone_number?: string; website?: string }
            }
            return {
                phone: data.result?.formatted_phone_number,
                website: data.result?.website,
            }
        } catch {
            return null
        }
    }

    private async enrichWithAI(
        prospects: DiscoveredProspect[],
        niche: string
    ): Promise<DiscoveredProspect[]> {
        if (prospects.length === 0) return []

        try {
            const prompt = `You are a sales research assistant. For each of these ${niche} businesses, generate:
1. A likely contact name (owner/manager)
2. A likely email address based on common patterns (firstname@domain.com)
3. A one-sentence summary of why they would benefit from a professional website/web app.

Businesses:
${prospects.map((p, i) => `${i + 1}. ${p.businessName} - ${p.location}${p.website ? ` (${p.website})` : ""}`).join("\n")}

Respond as JSON array with objects: { index, contactName, email, aiSummary }`

            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.anthropicApiKey,
                    "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify({
                    model: "claude-3-5-sonnet-20241022",
                    max_tokens: 2048,
                    messages: [{ role: "user", content: prompt }],
                }),
            })

            const data = (await res.json()) as {
                content?: Array<{ text: string }>
            }

            if (data.content?.[0]?.text) {
                const text = data.content[0].text
                const jsonMatch = text.match(/\[[\s\S]*\]/)
                if (jsonMatch) {
                    const enrichments = JSON.parse(jsonMatch[0]) as Array<{
                        index: number
                        contactName?: string
                        email?: string
                        aiSummary?: string
                    }>
                    for (const e of enrichments) {
                        const prospect = prospects[e.index - 1]
                        if (prospect) {
                            if (e.contactName) prospect.contactName = e.contactName
                            if (e.email) prospect.email = e.email
                            if (e.aiSummary) prospect.aiSummary = e.aiSummary
                        }
                    }
                }
            }
        } catch (error) {
            console.error("[AIResearch] AI enrichment failed:", error)
        }

        return prospects
    }

    private getMockProspects(
        niche: string,
        location: string,
        max: number
    ): DiscoveredProspect[] {
        const names = [
            `${niche} Solutions`,
            `Premier ${niche}`,
            `${location} ${niche} Group`,
            `Expert ${niche} Services`,
            `${niche} Associates`,
        ]
        return names.slice(0, max).map((name) => ({
            businessName: name,
            location,
            niche,
            aiSummary: `A ${niche.toLowerCase()} practice in ${location} that could benefit from a modern web presence.`,
        }))
    }
}
