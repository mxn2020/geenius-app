import { describe, it, expect, vi } from "vitest"
import { Hono } from "hono"
import { aiRouter } from "../routes/ai"

// Mock the environment variables before router initialization
vi.mock("../env", () => ({
    env: {
        CONVEX_URL: "http://test-convex.com",
    }
}))

// Mock ConvexHttpClient
vi.mock("convex/browser", () => {
    return {
        ConvexHttpClient: vi.fn(function () {
            return {
                query: vi.fn().mockImplementation((name, args) => {
                    if (name === "ai:getCurrentAllowance") {
                        return Promise.resolve({ id: "allowance123", creditsGranted: 10000 })
                    }
                    if (name === "ai:getAIUsage") {
                        return Promise.resolve(500)
                    }
                    return Promise.resolve(null)
                }),
                mutation: vi.fn().mockImplementation(() => Promise.resolve(true))
            }
        })
    }
})

// Mock auth middleware
vi.mock("../middleware/auth", () => ({
    authMiddleware: async (c: any, next: any) => {
        c.set("userId", "testuser123")
        await next()
    }
}))

describe("AI Router (/ai)", () => {
    // Mount the router
    const app = new Hono()
    app.route("/api", aiRouter)

    it("PUT /api/projects/:id/settings/ai-model should update model settings", async () => {
        const payload = { model: "claude-3-5-sonnet" }

        const res = await app.request("/api/projects/proj123/settings/ai-model", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })

        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data).toHaveProperty("data")
        expect((data as any).data.model).toBe("claude-3-5-sonnet")
    })

    it("GET /api/projects/:id/ai/usage should return structured usage metadata", async () => {
        const res = await app.request("/api/projects/proj123/ai/usage")
        expect(res.status).toBe(200)

        const data = await res.json()
        expect((data as any).data.allowance).toBeDefined()
        expect((data as any).data.creditsUsed).toBe(500)
    })
})
