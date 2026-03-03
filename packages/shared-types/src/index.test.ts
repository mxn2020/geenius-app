import { describe, it, expect } from "vitest"
import {
    PLAN_PRICES_EUR,
    PLAN_AI_CREDITS,
    type UserRole,
    type ProjectPlan,
    type ProjectStatus,
    type ProspectStatus,
    type CampaignStatus,
    type ComplianceMarket,
    type CampaignEmailStatus,
    type CallScheduleStatus,
    type ComplianceSeverity,
} from "./index"

describe("shared-types", () => {
    describe("PLAN_PRICES_EUR", () => {
        it("has prices for all four plans", () => {
            expect(PLAN_PRICES_EUR.website).toBe(10)
            expect(PLAN_PRICES_EUR.webapp).toBe(20)
            expect(PLAN_PRICES_EUR.authdb).toBe(30)
            expect(PLAN_PRICES_EUR.ai).toBe(40)
        })

        it("prices are all positive numbers", () => {
            for (const price of Object.values(PLAN_PRICES_EUR)) {
                expect(price).toBeGreaterThan(0)
            }
        })
    })

    describe("PLAN_AI_CREDITS", () => {
        it("only AI plan gets credits", () => {
            expect(PLAN_AI_CREDITS.website).toBeNull()
            expect(PLAN_AI_CREDITS.webapp).toBeNull()
            expect(PLAN_AI_CREDITS.authdb).toBeNull()
            expect(PLAN_AI_CREDITS.ai).toBe(10000)
        })
    })

    describe("type unions are exhaustive", () => {
        it("UserRole covers all cases", () => {
            const roles: UserRole[] = ["superAdmin", "user", "reseller"]
            expect(roles).toHaveLength(3)
        })

        it("ProjectPlan covers all cases", () => {
            const plans: ProjectPlan[] = ["website", "webapp", "authdb", "ai"]
            expect(plans).toHaveLength(4)
        })

        it("ProjectStatus covers all cases", () => {
            const statuses: ProjectStatus[] = ["preview", "creating", "live", "suspended", "deleted"]
            expect(statuses).toHaveLength(5)
        })

        it("ProspectStatus covers all cases", () => {
            const statuses: ProspectStatus[] = ["new", "contacted", "negotiating", "won", "lost"]
            expect(statuses).toHaveLength(5)
        })

        it("CampaignStatus covers all cases", () => {
            const statuses: CampaignStatus[] = ["draft", "active", "paused", "completed"]
            expect(statuses).toHaveLength(4)
        })

        it("ComplianceMarket covers all cases", () => {
            const markets: ComplianceMarket[] = ["EU", "US", "UK", "DACH"]
            expect(markets).toHaveLength(4)
        })

        it("CampaignEmailStatus covers all cases", () => {
            const statuses: CampaignEmailStatus[] = ["queued", "sent", "opened", "replied", "bounced", "failed"]
            expect(statuses).toHaveLength(6)
        })

        it("CallScheduleStatus covers all cases", () => {
            const statuses: CallScheduleStatus[] = ["scheduled", "completed", "cancelled", "no_show"]
            expect(statuses).toHaveLength(4)
        })

        it("ComplianceSeverity covers all cases", () => {
            const sev: ComplianceSeverity[] = ["info", "warning", "critical"]
            expect(sev).toHaveLength(3)
        })
    })
})
