import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { checkEnvConfigs } from "../env.js"

describe("checkEnvConfigs", () => {
    const originalEnv = process.env
    const originalLog = console.log
    const originalTable = console.table
    const originalError = console.error
    const originalExit = process.exit

    beforeEach(() => {
        vi.resetModules()
        process.env = { ...originalEnv }
        console.log = vi.fn()
        console.table = vi.fn()
        console.error = vi.fn()
        process.exit = vi.fn() as any
    })

    afterEach(() => {
        process.env = originalEnv
        console.log = originalLog
        console.table = originalTable
        console.error = originalError
        process.exit = originalExit
    })

    it("should not exit or log warnings if all fully required env vars are present", () => {
        // Fill all fields defined in envSchema
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
        process.env.WORKER_QUEUE_URL = "http://worker"

        checkEnvConfigs()

        expect(console.table).not.toHaveBeenCalled()
        expect(console.log).toHaveBeenCalledWith("✅ All Geenius API environment configurations are set.")
        expect(process.exit).not.toHaveBeenCalled()
    })

    it("should print a console table and warning if required variables are missing", () => {
        // Deliberately clear a required variable
        process.env.PORT = "3000"
        delete process.env.CONVEX_URL

        checkEnvConfigs()

        expect(console.table).toHaveBeenCalled()
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining("MISSING ENVIRONMENT CONFIGURATIONS"))
        // Still shouldn't crash if PORT is present
        expect(process.exit).not.toHaveBeenCalled()
    })

    it("should exit the process with code 1 if PORT is completely missing", () => {
        delete process.env.PORT
        delete process.env.CONVEX_URL

        checkEnvConfigs()

        expect(console.table).toHaveBeenCalled()
        expect(console.error).toHaveBeenCalledWith("FATAL: PORT is absolutely required to boot.")
        expect(process.exit).toHaveBeenCalledWith(1)
    })
})
