import { describe, it, expect, vi } from "vitest"
import { Hono } from "hono"
import { domainsRouter } from "../routes/domains"

// Mock env
vi.mock("../env", () => ({
    env: {
        CONVEX_URL: "http://test-convex.com",
        STRIPE_SECRET_KEY: "sk_test_123",
        NAMECHEAP_API_USER: "test",
        NAMECHEAP_API_KEY: "test",
        NAMECHEAP_CLIENT_IP: "1.2.3.4"
    }
}))

// Mock ConvexHttpClient
vi.mock("convex/browser", () => {
    return {
        ConvexHttpClient: vi.fn(function () {
            return {
                query: vi.fn().mockImplementation((name, args) => {
                    if (name === "domains:listDomains") {
                        return Promise.resolve([{ id: "dom123", domainName: "test.com" }])
                    }
                    return Promise.resolve(null)
                }),
                mutation: vi.fn().mockImplementation(() => Promise.resolve("dom123"))
            }
        })
    }
})

// Mock NamecheapService
vi.mock("../services/namecheap", () => {
    return {
        NamecheapService: vi.fn(function () {
            return {
                checkAvailability: vi.fn().mockResolvedValue([{ domain: "test.com", available: true, price: 1000 }]),
                getPrice: vi.fn().mockResolvedValue(1000),
                purchaseDomain: vi.fn().mockResolvedValue(true)
            }
        })
    }
})

// Mock StripeService
vi.mock("../services/stripe", () => {
    return {
        StripeService: vi.fn(function () {
            return {
                createPaymentIntent: vi.fn().mockResolvedValue({ client_secret: "secret_123" }),
                getPaymentIntent: vi.fn().mockImplementation((id) => {
                    if (id === "pi_failed") return Promise.resolve({ status: "failed" })
                    if (id === "pi_mismatch") return Promise.resolve({ status: "succeeded", metadata: { domainName: "wrong.com" } })
                    return Promise.resolve({ status: "succeeded", metadata: { domainName: "test.com", projectId: "proj123" } })
                })
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

describe("Domains Router (/domains)", () => {
    const app = new Hono()
    app.route("/api", domainsRouter)

    it("GET /api/domains/search should return availability for suggestions", async () => {
        const res = await app.request("/api/domains/search?query=test")
        expect(res.status).toBe(200)

        const data = await res.json()
        expect((data as any).data[0].domain).toBe("test.com")
        expect((data as any).data[0].available).toBe(true)
    })

    it("POST /api/projects/:id/domains/purchase should return clientSecret", async () => {
        const res = await app.request("/api/projects/proj123/domains/purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domainName: "test.com", paymentMethodId: "pm_123" })
        })

        expect(res.status).toBe(201)
        const data = await res.json()
        expect((data as any).data.clientSecret).toBe("secret_123")
    })

    it("POST /api/projects/:id/domains/purchase/confirm should complete purchase if intent succeeds", async () => {
        const res = await app.request("/api/projects/proj123/domains/purchase/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domainName: "test.com", paymentIntentId: "pi_success" })
        })

        expect(res.status).toBe(201)
        const data = await res.json()
        expect((data as any).data.domainId).toBe("dom123")
    })

    it("POST /api/projects/:id/domains/purchase/confirm should fail if intent failed", async () => {
        const res = await app.request("/api/projects/proj123/domains/purchase/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domainName: "test.com", paymentIntentId: "pi_failed" })
        })

        expect(res.status).toBe(402)
    })

    it("GET /api/projects/:id/domains should list domains", async () => {
        const res = await app.request("/api/projects/proj123/domains")
        expect(res.status).toBe(200)
        const data = await res.json()
        expect((data as any).data[0].domainName).toBe("test.com")
    })
})
