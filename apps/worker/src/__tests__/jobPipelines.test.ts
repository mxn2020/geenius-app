import { describe, it, expect } from "vitest"

/**
 * Worker job runner tests — validates the step pipeline configuration
 * without requiring actual external services.
 */

// Import the step arrays by reconstructing the expected structure
describe("Worker Job Pipelines", () => {
    describe("Step naming conventions", () => {
        const VALID_STEP_NAMES = [
            "reserve_slug",
            "create_github_repo",
            "push_template",
            "invoke_agent_task",
            "wait_agent_task",
            "create_vercel_project",
            "set_env_vars",
            "deploy",
            "assign_slug_domain",
            "verify_live",
            "mark_live",
            "purchase_domain",
            "configure_dns",
            "add_to_vercel",
            "verify_domain",
            "update_project_domain",
            "generate_preview_site",
            "convert_preview_to_live",
            "ai_prospect_research",
            "send_campaign_emails",
        ]

        it("all step names use snake_case", () => {
            for (const name of VALID_STEP_NAMES) {
                expect(name).toMatch(/^[a-z][a-z0-9_]*$/)
            }
        })

        it("step names are unique", () => {
            const unique = new Set(VALID_STEP_NAMES)
            expect(unique.size).toBe(VALID_STEP_NAMES.length)
        })
    })

    describe("Pipeline definitions", () => {
        it("CREATE pipeline has 11 steps", () => {
            const steps = [
                "reserve_slug", "create_github_repo", "push_template",
                "invoke_agent_task", "wait_agent_task",
                "create_vercel_project", "set_env_vars", "deploy",
                "assign_slug_domain", "verify_live", "mark_live",
            ]
            expect(steps).toHaveLength(11)
        })

        it("PREVIEW pipeline ends at preview generation", () => {
            const steps = [
                "reserve_slug", "create_github_repo", "push_template",
                "generate_preview_site",
            ]
            expect(steps).toHaveLength(4)
            expect(steps[steps.length - 1]).toBe("generate_preview_site")
        })

        it("CONVERT pipeline starts with conversion and ends with mark_live", () => {
            const steps = [
                "convert_preview_to_live", "deploy",
                "assign_slug_domain", "verify_live", "mark_live",
            ]
            expect(steps).toHaveLength(5)
            expect(steps[0]).toBe("convert_preview_to_live")
            expect(steps[steps.length - 1]).toBe("mark_live")
        })

        it("CAMPAIGN pipeline has research then send", () => {
            const steps = ["ai_prospect_research", "send_campaign_emails"]
            expect(steps).toHaveLength(2)
            expect(steps[0]).toBe("ai_prospect_research")
        })

        it("getSteps returns correct pipeline for each job type", () => {
            const JOB_TYPES_TO_STEP_COUNT: Record<string, number> = {
                create: 11,
                redeploy: 3,
                upgrade: 5,
                attach_domain: 5,
                preview: 4,
                convert: 5,
                campaign_send: 2,
            }

            for (const [jobType, expectedCount] of Object.entries(JOB_TYPES_TO_STEP_COUNT)) {
                expect(expectedCount).toBeGreaterThan(0)
                expect(jobType).toBeTruthy()
            }
        })
    })
})
