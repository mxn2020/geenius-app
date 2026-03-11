import { describe, it, expect, vi } from "vitest"
import { Hono } from "hono"
import { billingRouter } from "../routes/billing"

// Mock env
vi.mock("../env", () => ({
    env: {
        CONVEX_URL: "http://test-convex.com",
        STRIPE_SECRET_KEY: "sk_test_123",
        STRIPE_WEBHOOK_SECRET: "whsec_123"
    }
}))

// Mock ConvexHttpClient
vi.mock("convex/browser", () => {
    return {
        ConvexHttpClient: vi.fn(function () {
            return {
                query: vi.fn().mockImplementation((name, args) => {
                    if (name === "projects:getProject") {
                        if (args.id === "proj_not_found") return Promise.resolve(null)
                        return Promise.resolve({ id: "proj123", name: "Test" })
                    }
                    if (name === "subscriptions:getByProject") {
                        return Promise.resolve({ id: "sub123", status: "active" })
                    }
                    return Promise.resolve(null)
                }),
                mutation: vi.fn().mockImplementation(() => Promise.resolve(true))
            }
        })
    }
})

// Mock StripeService
vi.mock("../services/stripe", () => {
    return {
        StripeService: vi.fn(function () {
            return {
                createCustomer: vi.fn().mockResolvedValue({ id: "cus_123" }),
                createCheckoutSession: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
                verifyWebhookSignature: vi.fn().mockImplementation((payload) => {
                    return JSON.parse(payload)
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

describe("Billing Router (/billing)", () => {
    const app = new Hono()
    app.route("/api", billingRouter)

    it("POST /api/projects/:id/billing/checkout-session should return session URL", async () => {
        const payload = {
            priceId: "price_123",
            successUrl: "http://localhost/success",
            cancelUrl: "http://localhost/cancel"
        }

        const res = await app.request("/api/projects/proj123/billing/checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        expect(res.status).toBe(200)
        const data = await res.json()
        expect((data as any).data.url).toBe("https://checkout.stripe.com/test")
    })

    it("POST /api/projects/:id/billing/checkout-session should 404 for unknown project", async () => {
        const payload = {
            priceId: "price_123",
            successUrl: "http://localhost/success",
            cancelUrl: "http://localhost/cancel"
        }

        const res = await app.request("/api/projects/proj_not_found/billing/checkout-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        expect(res.status).toBe(404)
    })

    it("GET /api/projects/:id/billing should return subscription details", async () => {
        const res = await app.request("/api/projects/proj123/billing")

        expect(res.status).toBe(200)
        const data = await res.json()
        expect((data as any).data.subscription.status).toBe("active")
    })

    it("POST /api/webhook/stripe should process valid webhook events", async () => {
        const mockStripeEvent = {
            type: "invoice.payment_failed",
            data: { object: { subscription: "sub_123" } }
        }

        const res = await app.request("/api/webhook/stripe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "stripe-signature": "valid-signature"
            },
            body: JSON.stringify(mockStripeEvent)
        })

        expect(res.status).toBe(200)
        const data = await res.json()
        expect(data).toHaveProperty("received", true)
    })
})
