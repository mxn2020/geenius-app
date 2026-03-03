import { describe, it, expect } from "vitest"
import {
    SlugSchema,
    CreateProjectSchema,
    PurchaseDomainSchema,
    UpdateAIModelSchema,
    RESERVED_SLUGS,
} from "./index"

describe("SlugSchema", () => {
    it("accepts valid slugs", () => {
        expect(SlugSchema.safeParse("my-app").success).toBe(true)
        expect(SlugSchema.safeParse("hello123").success).toBe(true)
        expect(SlugSchema.safeParse("abc").success).toBe(true)
    })

    it("rejects slugs shorter than 3 characters", () => {
        expect(SlugSchema.safeParse("ab").success).toBe(false)
    })

    it("rejects slugs longer than 48 characters", () => {
        expect(SlugSchema.safeParse("a".repeat(49)).success).toBe(false)
    })

    it("rejects uppercase characters", () => {
        expect(SlugSchema.safeParse("MyApp").success).toBe(false)
    })

    it("rejects special characters", () => {
        expect(SlugSchema.safeParse("my_app").success).toBe(false)
        expect(SlugSchema.safeParse("my.app").success).toBe(false)
        expect(SlugSchema.safeParse("my app").success).toBe(false)
    })

    it("rejects slugs starting with a hyphen", () => {
        expect(SlugSchema.safeParse("-my-app").success).toBe(false)
    })

    it("rejects slugs ending with a hyphen", () => {
        expect(SlugSchema.safeParse("my-app-").success).toBe(false)
    })

    it("rejects all reserved slugs", () => {
        for (const reserved of RESERVED_SLUGS) {
            const result = SlugSchema.safeParse(reserved)
            // Reserved slugs that are 3+ chars should fail
            if (reserved.length >= 3) {
                expect(result.success).toBe(false)
            }
        }
    })
})

describe("CreateProjectSchema", () => {
    it("accepts valid project creation input", () => {
        const result = CreateProjectSchema.safeParse({
            name: "My Project",
            slug: "my-project",
            plan: "website",
        })
        expect(result.success).toBe(true)
    })

    it("rejects missing name", () => {
        const result = CreateProjectSchema.safeParse({
            name: "",
            slug: "my-project",
            plan: "website",
        })
        expect(result.success).toBe(false)
    })

    it("rejects invalid plan", () => {
        const result = CreateProjectSchema.safeParse({
            name: "My Project",
            slug: "my-project",
            plan: "invalid",
        })
        expect(result.success).toBe(false)
    })

    it("accepts all valid plans", () => {
        for (const plan of ["website", "webapp", "authdb", "ai"]) {
            const result = CreateProjectSchema.safeParse({
                name: "Test",
                slug: "test-app",
                plan,
            })
            expect(result.success).toBe(true)
        }
    })

    it("rejects name over 100 characters", () => {
        const result = CreateProjectSchema.safeParse({
            name: "x".repeat(101),
            slug: "my-project",
            plan: "website",
        })
        expect(result.success).toBe(false)
    })
})

describe("PurchaseDomainSchema", () => {
    it("accepts valid domain input", () => {
        const result = PurchaseDomainSchema.safeParse({
            projectId: "abc123",
            domainName: "example.com",
        })
        expect(result.success).toBe(true)
    })

    it("rejects invalid domain format", () => {
        const result = PurchaseDomainSchema.safeParse({
            projectId: "abc123",
            domainName: "notadomain",
        })
        expect(result.success).toBe(false)
    })

    it("rejects empty projectId", () => {
        const result = PurchaseDomainSchema.safeParse({
            projectId: "",
            domainName: "example.com",
        })
        expect(result.success).toBe(false)
    })
})

describe("UpdateAIModelSchema", () => {
    it("accepts valid AI model input", () => {
        const valid = UpdateAIModelSchema.safeParse({
            projectId: "p123",
            model: "gpt-4o",
        })
        expect(valid.success).toBe(true)
    })

    it("accepts all valid models", () => {
        for (const model of ["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "claude-3-haiku"]) {
            const result = UpdateAIModelSchema.safeParse({ projectId: "p1", model })
            expect(result.success).toBe(true)
        }
    })

    it("rejects invalid model name", () => {
        const result = UpdateAIModelSchema.safeParse({
            projectId: "p123",
            model: "gpt-3",
        })
        expect(result.success).toBe(false)
    })
})
