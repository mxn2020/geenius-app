import { describe, it, expect } from "vitest"
import {
  SlugSchema,
  CreateProjectSchema,
  PurchaseDomainSchema,
  UpdateAIModelSchema,
  RESERVED_SLUGS,
} from "../src/index"

describe("SlugSchema", () => {
  it("accepts valid slugs", () => {
    expect(SlugSchema.safeParse("my-project").success).toBe(true)
    expect(SlugSchema.safeParse("hello123").success).toBe(true)
    expect(SlugSchema.safeParse("abc").success).toBe(true)
  })

  it("rejects slugs that are too short", () => {
    expect(SlugSchema.safeParse("ab").success).toBe(false)
  })

  it("rejects slugs that are too long", () => {
    expect(SlugSchema.safeParse("a".repeat(49)).success).toBe(false)
  })

  it("rejects slugs with uppercase letters", () => {
    expect(SlugSchema.safeParse("MyProject").success).toBe(false)
  })

  it("rejects slugs with underscores", () => {
    expect(SlugSchema.safeParse("my_project").success).toBe(false)
  })

  it("rejects slugs starting with hyphen", () => {
    expect(SlugSchema.safeParse("-myproject").success).toBe(false)
  })

  it("rejects slugs ending with hyphen", () => {
    expect(SlugSchema.safeParse("myproject-").success).toBe(false)
  })

  it("rejects reserved slugs", () => {
    for (const slug of RESERVED_SLUGS) {
      expect(SlugSchema.safeParse(slug).success).toBe(false)
    }
  })
})

describe("CreateProjectSchema", () => {
  it("accepts valid project input", () => {
    expect(
      CreateProjectSchema.safeParse({ name: "My Project", slug: "my-project", plan: "website" }).success
    ).toBe(true)
  })

  it("rejects missing name", () => {
    expect(
      CreateProjectSchema.safeParse({ slug: "my-project", plan: "website" }).success
    ).toBe(false)
  })

  it("rejects invalid plan", () => {
    expect(
      CreateProjectSchema.safeParse({ name: "x", slug: "my-project", plan: "enterprise" }).success
    ).toBe(false)
  })
})

describe("PurchaseDomainSchema", () => {
  it("accepts valid domain", () => {
    expect(
      PurchaseDomainSchema.safeParse({ projectId: "proj_1", domainName: "example.com" }).success
    ).toBe(true)
  })

  it("rejects invalid domain format", () => {
    expect(
      PurchaseDomainSchema.safeParse({ projectId: "proj_1", domainName: "notadomain" }).success
    ).toBe(false)
  })
})

describe("UpdateAIModelSchema", () => {
  it("accepts valid model", () => {
    expect(
      UpdateAIModelSchema.safeParse({ projectId: "proj_1", model: "gpt-4o" }).success
    ).toBe(true)
  })

  it("rejects unknown model", () => {
    expect(
      UpdateAIModelSchema.safeParse({ projectId: "proj_1", model: "gpt-5" }).success
    ).toBe(false)
  })
})
