import { describe, it, expect } from "vitest"
import { StripeService } from "../stripe.js"

describe("StripeService", () => {
    it("should initialize cleanly and use a dummy token if STRIPE_SECRET_KEY is omitted without crashing", () => {
        // If the Stripe SDK hits an empty string, it synchronously crashes Node 
        // This test ensures our fallback wrapper handles the init cleanly.

        // We expect new StripeService("") NOT to throw
        expect(() => {
            new StripeService("")
        }).not.toThrow()

        expect(() => {
            new StripeService(undefined as any)
        }).not.toThrow()
    })

    it("should initialize normally when given a valid sk_ string", () => {
        expect(() => {
            new StripeService("sk_test_12345")
        }).not.toThrow()
    })
})
