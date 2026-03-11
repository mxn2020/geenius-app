import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("validateEnv", () => {
    const originalEnv = process.env

    beforeEach(() => {
        vi.resetModules()
        process.env = { ...originalEnv }
    })

    afterEach(() => {
        process.env = originalEnv
    })

    it("should not throw if all required env vars are present", async () => {
        process.env.PORT = "3000"
        process.env.CONVEX_URL = "http://test.com"
        process.env.CONVEX_AUTH_SECRET = "secret"
        process.env.GITHUB_ORG = "org"
        process.env.GITHUB_APP_ID = "123"
        process.env.GITHUB_APP_PRIVATE_KEY = "key"
        process.env.VERCEL_API_TOKEN = "token"
        process.env.STRIPE_SECRET_KEY = "sk_test"
        process.env.STRIPE_WEBHOOK_SECRET = "whsec"
        process.env.STRIPE_PRICE_WEBSITE = "price_1"
        process.env.STRIPE_PRICE_WEBAPP = "price_2"
        process.env.STRIPE_PRICE_AUTHDB = "price_3"
        process.env.STRIPE_PRICE_AI = "price_4"
        process.env.NAMECHEAP_API_USER = "user"
        process.env.NAMECHEAP_API_KEY = "key"
        process.env.NAMECHEAP_CLIENT_IP = "ip"
        process.env.ENCRYPTION_KEY = "enc_key"
        process.env.WORKER_QUEUE_URL = "http://worker.local"

        const { validateEnv } = await import("../env.js")
        expect(() => validateEnv()).not.toThrow()
    })

    it("should throw if required variables are missing", async () => {
        process.env.PORT = "3000"
        delete process.env.CONVEX_URL
        delete process.env.CONVEX_AUTH_SECRET

        await expect(import("../env.js")).rejects.toThrow()
    })

    it("should accept optional variables being absent", async () => {
        process.env.PORT = "3000"
        process.env.CONVEX_URL = "http://test.com"
        process.env.CONVEX_AUTH_SECRET = "secret"
        process.env.GITHUB_ORG = "org"
        process.env.GITHUB_APP_ID = "123"
        process.env.GITHUB_APP_PRIVATE_KEY = "key"
        process.env.VERCEL_API_TOKEN = "token"
        process.env.STRIPE_SECRET_KEY = "sk_test"
        process.env.STRIPE_WEBHOOK_SECRET = "whsec"
        process.env.STRIPE_PRICE_WEBSITE = "price_1"
        process.env.STRIPE_PRICE_WEBAPP = "price_2"
        process.env.STRIPE_PRICE_AUTHDB = "price_3"
        process.env.STRIPE_PRICE_AI = "price_4"
        process.env.NAMECHEAP_API_USER = "user"
        process.env.NAMECHEAP_API_KEY = "key"
        process.env.NAMECHEAP_CLIENT_IP = "ip"
        process.env.ENCRYPTION_KEY = "enc_key"
        process.env.WORKER_QUEUE_URL = "http://worker.local"
        // Optional vars not set: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_PLACES_API_KEY, RESEND_API_KEY, WORKER_SECRET

        const { validateEnv } = await import("../env.js")
        const env = validateEnv()
        expect(env.CONVEX_URL).toBe("http://test.com")
        expect(env.OPENAI_API_KEY).toBeUndefined()
    })
})
