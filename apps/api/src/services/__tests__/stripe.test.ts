import { describe, it, expect } from "vitest"
import { StripeService } from "../stripe.js"

describe("StripeService", () => {
    it("should throw if STRIPE_SECRET_KEY is omitted or empty", () => {
        // We expect new StripeService("") to throw

        expect(() => {
            new StripeService("")
        }).toThrow("STRIPE_SECRET_KEY is required")

        expect(() => {
            new StripeService(undefined as any)
        }).toThrow("STRIPE_SECRET_KEY is required")
    })

    it("should initialize normally when given a valid sk_ string", () => {
        expect(() => {
            new StripeService("sk_test_12345")
        }).not.toThrow()
    })
})
