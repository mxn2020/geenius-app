import { describe, it, expect, vi, beforeEach } from "vitest"
import type { JobContext } from "../lib/context.js"

/**
 * Creates a mock JobContext with tracked calls to convex.query and convex.mutation.
 */
function createMockContext(overrides: Partial<JobContext> = {}): JobContext & {
    logs: { level: string; message: string }[]
    queries: { fn: string; args: Record<string, unknown> }[]
    mutations: { fn: string; args: Record<string, unknown> }[]
} {
    const logs: { level: string; message: string }[] = []
    const queries: { fn: string; args: Record<string, unknown> }[] = []
    const mutations: { fn: string; args: Record<string, unknown> }[] = []

    const queryResults = new Map<string, unknown>()
    const mutationResults = new Map<string, unknown>()

    const ctx: ReturnType<typeof createMockContext> = {
        jobId: "test-job-id",
        projectId: "test-project-id",
        jobType: "create",
        logs,
        queries,
        mutations,
        log: async (level, message) => {
            logs.push({ level, message })
        },
        convex: {
            query: async <T>(fn: string, args: Record<string, unknown>) => {
                queries.push({ fn, args })
                return (queryResults.get(fn) ?? null) as T
            },
            mutation: async <T>(fn: string, args: Record<string, unknown>) => {
                mutations.push({ fn, args })
                return (mutationResults.get(fn) ?? null) as T
            },
        },
        ...overrides,
    }

        // Helper to set query return value
        ; (ctx as any).setQueryResult = (fn: string, result: unknown) => queryResults.set(fn, result)
        ; (ctx as any).setMutationResult = (fn: string, result: unknown) => mutationResults.set(fn, result)

    return ctx
}

// ─── createGithubRepo Tests ──────────────────────────────────────

describe("createGithubRepo", () => {
    it("should skip if GitHub service not configured", async () => {
        const { createGithubRepo } = await import("../steps/createGithubRepo.js")
        const ctx = createMockContext({ github: undefined })

        await createGithubRepo(ctx)

        expect(ctx.logs.some(l => l.message.includes("not configured"))).toBe(true)
        expect(ctx.mutations).toHaveLength(0) // No mutations called
    })

    it("should skip if repo already exists", async () => {
        const { createGithubRepo } = await import("../steps/createGithubRepo.js")
        const mockGithub = {
            createRepo: vi.fn(),
            repoExists: vi.fn(),
            pushTemplate: vi.fn(),
            getBranchSHA: vi.fn(),
            waitForCIPass: vi.fn(),
            createDispatchEvent: vi.fn(),
        }
        const ctx = createMockContext({ github: mockGithub })
            ; (ctx as any).setQueryResult("projects:workerGetProject", {
                slug: "test-slug",
                githubRepoId: "org/existing-repo",
            })

        await createGithubRepo(ctx)

        expect(mockGithub.createRepo).not.toHaveBeenCalled()
        expect(ctx.logs.some(l => l.message.includes("already exists"))).toBe(true)
    })

    it("should create repo and store result", async () => {
        const { createGithubRepo } = await import("../steps/createGithubRepo.js")
        const mockGithub = {
            createRepo: vi.fn().mockResolvedValue({
                id: 123,
                name: "proj-test",
                full_name: "myorg/proj-test",
            }),
            repoExists: vi.fn(),
            pushTemplate: vi.fn(),
            getBranchSHA: vi.fn(),
            waitForCIPass: vi.fn(),
            createDispatchEvent: vi.fn(),
        }
        const ctx = createMockContext({ github: mockGithub })
            ; (ctx as any).setQueryResult("projects:workerGetProject", {
                slug: "test-slug",
                githubRepoId: undefined,
            })

        process.env["GITHUB_ORG"] = "testorg"
        await createGithubRepo(ctx)

        expect(mockGithub.createRepo).toHaveBeenCalledWith("testorg", "proj-test-project-id")
        expect(ctx.mutations).toContainEqual(
            expect.objectContaining({
                fn: "projects:updateProject",
                args: expect.objectContaining({ githubRepoId: "myorg/proj-test" }),
            })
        )
    })
})

// ─── triggerCI Tests ──────────────────────────────────────────────

describe("triggerCI", () => {
    it("should skip if GitHub service not configured", async () => {
        const { triggerCI } = await import("../steps/triggerCI.js")
        const ctx = createMockContext({ github: undefined })

        await triggerCI(ctx)

        expect(ctx.logs.some(l => l.message.includes("not configured"))).toBe(true)
    })

    it("should call createDispatchEvent with deploy event type", async () => {
        const { triggerCI } = await import("../steps/triggerCI.js")
        const mockGithub = {
            createRepo: vi.fn(),
            repoExists: vi.fn(),
            pushTemplate: vi.fn(),
            getBranchSHA: vi.fn(),
            waitForCIPass: vi.fn(),
            createDispatchEvent: vi.fn().mockResolvedValue(undefined),
        }
        const ctx = createMockContext({ github: mockGithub })

        await triggerCI(ctx)

        expect(mockGithub.createDispatchEvent).toHaveBeenCalledWith(
            "proj-test-project-id",
            "deploy"
        )
    })
})

// ─── waitCI Tests ──────────────────────────────────────────────

describe("waitCI", () => {
    it("should skip if GitHub service not configured", async () => {
        const { waitCI } = await import("../steps/waitCI.js")
        const ctx = createMockContext({ github: undefined })

        await waitCI(ctx)

        expect(ctx.logs.some(l => l.message.includes("not configured"))).toBe(true)
    })

    it("should call getBranchSHA and waitForCIPass", async () => {
        const { waitCI } = await import("../steps/waitCI.js")
        const mockGithub = {
            createRepo: vi.fn(),
            repoExists: vi.fn(),
            pushTemplate: vi.fn(),
            getBranchSHA: vi.fn().mockResolvedValue("abc123"),
            waitForCIPass: vi.fn().mockResolvedValue(undefined),
            createDispatchEvent: vi.fn(),
        }
        const ctx = createMockContext({ github: mockGithub })

        await waitCI(ctx)

        expect(mockGithub.getBranchSHA).toHaveBeenCalledWith("proj-test-project-id", "main")
        expect(mockGithub.waitForCIPass).toHaveBeenCalledWith(
            "proj-test-project-id",
            "abc123",
            expect.any(Number)
        )
    })
})

// ─── pushTemplate Tests ──────────────────────────────────────────

describe("pushTemplate", () => {
    it("should skip if GitHub service not configured", async () => {
        const { pushTemplate } = await import("../steps/pushTemplate.js")
        const ctx = createMockContext({ github: undefined })

        await pushTemplate(ctx)

        expect(ctx.logs.some(l => l.message.includes("not configured"))).toBe(true)
    })

    it("should throw if no GitHub repo created yet", async () => {
        const { pushTemplate } = await import("../steps/pushTemplate.js")
        const mockGithub = {
            createRepo: vi.fn(),
            repoExists: vi.fn(),
            pushTemplate: vi.fn(),
            getBranchSHA: vi.fn(),
            waitForCIPass: vi.fn(),
            createDispatchEvent: vi.fn(),
        }
        const ctx = createMockContext({ github: mockGithub })
            ; (ctx as any).setQueryResult("projects:workerGetProject", {
                slug: "test-slug",
                plan: "website",
                githubRepoId: undefined,
            })

        await expect(pushTemplate(ctx)).rejects.toThrow("not created yet")
    })

    it("should push correct template for plan", async () => {
        const { pushTemplate } = await import("../steps/pushTemplate.js")
        const mockGithub = {
            createRepo: vi.fn(),
            repoExists: vi.fn(),
            pushTemplate: vi.fn().mockResolvedValue(undefined),
            getBranchSHA: vi.fn(),
            waitForCIPass: vi.fn(),
            createDispatchEvent: vi.fn(),
        }
        const ctx = createMockContext({ github: mockGithub })
            ; (ctx as any).setQueryResult("projects:workerGetProject", {
                slug: "test-slug",
                plan: "ai",
                githubRepoId: "org/test-repo",
            })

        await pushTemplate(ctx)

        expect(mockGithub.pushTemplate).toHaveBeenCalledWith(
            "proj-test-project-id",
            "template-webapp-vite-react-convex-auth-db-ai"
        )
    })
})

// ─── attachDomain Tests ──────────────────────────────────────────

describe("attachDomain steps", () => {
    describe("purchaseDomainStep", () => {
        it("should skip if Namecheap not configured", async () => {
            const { purchaseDomainStep } = await import("../steps/attachDomain.js")
            const ctx = createMockContext({ namecheap: undefined })
                ; (ctx as any).setQueryResult("projects:workerGetProject", {
                    slug: "test", pendingDomain: "example.com",
                })

            await purchaseDomainStep(ctx)

            expect(ctx.logs.some(l => l.message.includes("not configured"))).toBe(true)
        })

        it("should throw if no pending domain", async () => {
            const { purchaseDomainStep } = await import("../steps/attachDomain.js")
            const ctx = createMockContext()
                ; (ctx as any).setQueryResult("projects:workerGetProject", { slug: "test" })

            await expect(purchaseDomainStep(ctx)).rejects.toThrow("No pending domain")
        })

        it("should call namecheap.purchaseDomain and update status", async () => {
            const { purchaseDomainStep } = await import("../steps/attachDomain.js")
            const mockNamecheap = {
                checkAvailability: vi.fn(),
                getPrice: vi.fn(),
                purchaseDomain: vi.fn().mockResolvedValue(undefined),
                setDNStoVercel: vi.fn(),
                getDomainStatus: vi.fn(),
                renewDomain: vi.fn(),
            }
            const ctx = createMockContext({ namecheap: mockNamecheap })
                ; (ctx as any).setQueryResult("projects:workerGetProject", {
                    slug: "test", pendingDomain: "example.com",
                })

            await purchaseDomainStep(ctx)

            expect(mockNamecheap.purchaseDomain).toHaveBeenCalledWith("example.com", 1)
            expect(ctx.mutations).toContainEqual(
                expect.objectContaining({
                    fn: "domains:workerUpdateDomainStatus",
                    args: expect.objectContaining({
                        domainName: "example.com",
                        status: "configuring",
                    }),
                })
            )
        })
    })

    describe("verifyDomainStep", () => {
        it("should call vercel.waitForDomainVerification and update to active", async () => {
            const { verifyDomainStep } = await import("../steps/attachDomain.js")
            const mockVercel = {
                createProject: vi.fn(),
                getProject: vi.fn(),
                addDomain: vi.fn(),
                removeDomain: vi.fn(),
                triggerDeploy: vi.fn(),
                getDeploymentStatus: vi.fn(),
                setEnvVars: vi.fn(),
                waitForDomainVerification: vi.fn().mockResolvedValue(undefined),
            }
            const ctx = createMockContext({ vercel: mockVercel })
                ; (ctx as any).setQueryResult("projects:workerGetProject", {
                    slug: "test", pendingDomain: "example.com", vercelProjectId: "prj_123",
                })

            await verifyDomainStep(ctx)

            expect(mockVercel.waitForDomainVerification).toHaveBeenCalledWith(
                "prj_123", "example.com", 30 * 60 * 1000
            )
            expect(ctx.mutations).toContainEqual(
                expect.objectContaining({
                    fn: "domains:workerUpdateDomainStatus",
                    args: expect.objectContaining({ status: "active" }),
                })
            )
        })
    })
})

// ─── sendCampaignEmails Tests ────────────────────────────────────

describe("sendCampaignEmails", () => {
    it("should skip if no campaignId in metadata", async () => {
        const { sendCampaignEmails } = await import("../steps/sendCampaignEmails.js")
        const ctx = createMockContext({ meta: {} })

        await sendCampaignEmails(ctx)

        expect(ctx.logs.some(l => l.message.includes("No campaignId"))).toBe(true)
    })

    it("should skip if no queued emails", async () => {
        const { sendCampaignEmails } = await import("../steps/sendCampaignEmails.js")
        const ctx = createMockContext({ meta: { campaignId: "campaign-123" } })
            ; (ctx as any).setQueryResult("campaigns:getCampaign", {
                _id: "campaign-123",
                resellerId: "user-1",
                name: "Test Campaign",
                templateSubject: "Hello",
                templateBody: "World",
            })
            ; (ctx as any).setQueryResult("resellers:workerGetProfile", {
                companyName: "Test Co",
                resendApiKey: "re_test",
            })
            ; (ctx as any).setQueryResult("campaigns:getQueuedEmails", [])

        await sendCampaignEmails(ctx)

        expect(ctx.logs.some(l => l.message.includes("No queued emails"))).toBe(true)
    })

    it("should skip if reseller has no Resend API key", async () => {
        const { sendCampaignEmails } = await import("../steps/sendCampaignEmails.js")
        const ctx = createMockContext({ meta: { campaignId: "campaign-123" } })
            ; (ctx as any).setQueryResult("campaigns:getCampaign", {
                _id: "campaign-123",
                resellerId: "user-1",
                name: "Test Campaign",
                templateSubject: "Hello",
                templateBody: "World",
            })
            ; (ctx as any).setQueryResult("resellers:workerGetProfile", {
                companyName: "Test Co",
                resendApiKey: undefined,
            })

        await sendCampaignEmails(ctx)

        expect(ctx.logs.some(l => l.message.includes("no Resend API key"))).toBe(true)
    })

    it("should process emails and update their status to sent on success", async () => {
        const { sendCampaignEmails } = await import("../steps/sendCampaignEmails.js")

        // Mock global fetch for Resend API
        const originalFetch = globalThis.fetch
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: "resend-msg-123" })
        } as any)

        const ctx = createMockContext({ meta: { campaignId: "campaign-123" } })
            ; (ctx as any).setQueryResult("campaigns:getCampaign", {
                _id: "campaign-123",
                resellerId: "user-1",
                name: "Test Campaign",
                templateSubject: "Hello {{name}}",
                templateBody: "World",
            })
            ; (ctx as any).setQueryResult("resellers:workerGetProfile", {
                companyName: "Test Co",
                resendApiKey: "re_test",
            })
            ; (ctx as any).setQueryResult("campaigns:getQueuedEmails", [
                { _id: "email-1", prospectId: "prospect-1" }
            ])
            ; (ctx as any).setQueryResult("prospects:getProspect", {
                _id: "prospect-1",
                email: "test@example.com",
                contactName: "John Doe",
                businessName: "Test Business"
            })

        try {
            await sendCampaignEmails(ctx)

            // Verify fetch was called correctly
            expect(globalThis.fetch).toHaveBeenCalledWith(
                "https://api.resend.com/emails",
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        Authorization: "Bearer re_test"
                    })
                })
            )

            // Verify mutations updated the state
            expect(ctx.mutations).toContainEqual(
                expect.objectContaining({
                    fn: "campaigns:workerUpdateEmailStatus",
                    args: expect.objectContaining({
                        id: "email-1",
                        status: "sent",
                        resendMessageId: "resend-msg-123"
                    })
                })
            )

            // Verify campaign totalSent updated
            expect(ctx.mutations).toContainEqual(
                expect.objectContaining({
                    fn: "campaigns:workerUpdateCampaign",
                    args: expect.objectContaining({
                        id: "campaign-123",
                        totalSent: 1
                    })
                })
            )

            expect(ctx.logs.some(l => l.message.includes("sent"))).toBe(true)
        } finally {
            globalThis.fetch = originalFetch
        }
    })

    it("should record failure and not update prospect status if email send fails", async () => {
        const { sendCampaignEmails } = await import("../steps/sendCampaignEmails.js")

        // Mock global fetch to simulate failure
        const originalFetch = globalThis.fetch
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            text: async () => "API Error: Invalid key"
        } as any)

        const ctx = createMockContext({ meta: { campaignId: "campaign-123" } })
            ; (ctx as any).setQueryResult("campaigns:getCampaign", {
                _id: "campaign-123",
                resellerId: "user-1"
            })
            ; (ctx as any).setQueryResult("resellers:workerGetProfile", {
                companyName: "Test Co",
                resendApiKey: "re_test_bad",
            })
            ; (ctx as any).setQueryResult("campaigns:getQueuedEmails", [
                { _id: "email-1", prospectId: "prospect-1" }
            ])
            ; (ctx as any).setQueryResult("prospects:getProspect", {
                _id: "prospect-1",
                email: "test@example.com"
            })

        try {
            await sendCampaignEmails(ctx)

            // Should update email status to failed
            expect(ctx.mutations).toContainEqual(
                expect.objectContaining({
                    fn: "campaigns:workerUpdateEmailStatus",
                    args: expect.objectContaining({
                        id: "email-1",
                        status: "failed"
                    })
                })
            )

            // Make sure prospect wasn't updated to contacted
            expect(ctx.mutations).not.toContainEqual(
                expect.objectContaining({
                    fn: "prospects:workerUpdateProspect",
                    args: expect.objectContaining({
                        id: "prospect-1",
                        status: "contacted"
                    })
                })
            )
        } finally {
            globalThis.fetch = originalFetch
        }
    })
})

// ─── convertPreviewToLive Tests ──────────────────────────────────

describe("convertPreviewToLive", () => {
    it("should transition project to creating state", async () => {
        const { convertPreviewToLive } = await import("../steps/convertPreviewToLive.js")
        const ctx = createMockContext()
            ; (ctx as any).setQueryResult("projects:workerGetProject", {
                slug: "test-slug",
                plan: "website",
                name: "Test",
                status: "preview",
            })

        await convertPreviewToLive(ctx)

        expect(ctx.mutations).toContainEqual(
            expect.objectContaining({
                fn: "projects:updateProject",
                args: expect.objectContaining({ status: "creating" }),
            })
        )
    })

    it("should update prospect status to won if linked", async () => {
        const { convertPreviewToLive } = await import("../steps/convertPreviewToLive.js")
        const ctx = createMockContext()
            ; (ctx as any).setQueryResult("projects:workerGetProject", {
                slug: "test-slug",
                plan: "website",
                name: "Test",
                status: "preview",
                prospectId: "prospect-1",
            })
            ; (ctx as any).setQueryResult("prospects:getProspect", {
                status: "negotiating",
                businessName: "Acme Inc",
            })

        await convertPreviewToLive(ctx)

        expect(ctx.mutations).toContainEqual(
            expect.objectContaining({
                fn: "prospects:workerUpdateProspect",
                args: expect.objectContaining({ status: "won" }),
            })
        )
    })
})

// ─── invokeAgentTask Tests ────────────────────────────────────────

describe("invokeAgentTask", () => {
    it("should log warning and continue in dev mode when CLI fails", async () => {
        const { invokeAgentTask } = await import("../steps/invokeAgentTask.js")
        const ctx = createMockContext()
            ; (ctx as any).setQueryResult("projects:workerGetProject", {
                slug: "test-slug",
                plan: "website",
                name: "Test",
            })

        // Should not throw in dev mode (NODE_ENV != production)
        const origEnv = process.env["NODE_ENV"]
        process.env["NODE_ENV"] = "development"
        try {
            await invokeAgentTask(ctx)
            expect(ctx.logs.some(l => l.level === "warn")).toBe(true)
        } finally {
            process.env["NODE_ENV"] = origEnv
        }
    })
})

// ─── aiProspectResearch Tests ──────────────────────────────────

describe("aiProspectResearch", () => {
    it("should skip if no campaignId", async () => {
        const { aiProspectResearch } = await import("../steps/aiProspectResearch.js")
        const ctx = createMockContext({ meta: {} })

        await aiProspectResearch(ctx)

        expect(ctx.logs.some(l => l.message.includes("No campaignId"))).toBe(true)
    })

    it("should handle empty results gracefully", async () => {
        const { aiProspectResearch } = await import("../steps/aiProspectResearch.js")
        const ctx = createMockContext({ meta: { campaignId: "campaign-123" } })
            ; (ctx as any).setQueryResult("campaigns:getCampaign", {
                _id: "campaign-123",
                resellerId: "user-1",
                name: "Test",
                niche: "restaurants",
                location: "NYC",
            })

        // Mock fetch to simulate API failure
        const originalFetch = globalThis.fetch
        globalThis.fetch = vi.fn().mockRejectedValue(new Error("API not available"))

        try {
            await aiProspectResearch(ctx)
            expect(ctx.logs.some(l => l.message.includes("No prospects discovered"))).toBe(true)
        } finally {
            globalThis.fetch = originalFetch
        }
    })
})
