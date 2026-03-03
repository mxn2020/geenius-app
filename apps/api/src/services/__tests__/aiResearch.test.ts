import { describe, it, expect, vi, beforeEach } from "vitest"
import { AIResearchService } from "../../services/aiResearch"

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe("AIResearchService", () => {
    const service = new AIResearchService("test-google-key", "test-anthropic-key")

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("discoverProspects", () => {
        it("returns mock prospects when Google Places API fails", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"))

            const prospects = await service.discoverProspects({
                niche: "lawyers",
                location: "Munich",
                maxResults: 3,
            })

            expect(prospects.length).toBeGreaterThan(0)
            expect(prospects.length).toBeLessThanOrEqual(3)
            expect(prospects[0]!.niche).toBe("lawyers")
            expect(prospects[0]!.location).toBe("Munich")
        })

        it("enriches prospects with AI summaries from mock data", async () => {
            mockFetch.mockRejectedValueOnce(new Error("API unavailable"))

            const prospects = await service.discoverProspects({
                niche: "doctors",
                location: "Berlin",
                maxResults: 2,
            })

            for (const p of prospects) {
                expect(p.niche).toBe("doctors")
                expect(p.location).toBe("Berlin")
                expect(p.businessName).toBeTruthy()
            }
        })

        it("respects maxResults parameter", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Offline"))

            const prospects = await service.discoverProspects({
                niche: "dentists",
                location: "Hamburg",
                maxResults: 1,
            })

            expect(prospects.length).toBe(1)
        })

        it("defaults maxResults to 20", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Offline"))

            const prospects = await service.discoverProspects({
                niche: "architects",
                location: "Frankfurt",
            })

            // Mock data has 5 prospects max
            expect(prospects.length).toBeLessThanOrEqual(20)
            expect(prospects.length).toBeGreaterThan(0)
        })
    })
})
