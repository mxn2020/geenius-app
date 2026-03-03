import { describe, it, expect, vi } from "vitest"
import { ResendService } from "../../services/resend"

// Mock the Resend SDK — handle both named and default export
vi.mock("resend", () => {
    class MockResend {
        emails = {
            send: vi.fn().mockResolvedValue({ data: { id: "msg_test_123" }, error: null }),
        }
        batch = {
            send: vi.fn().mockResolvedValue({
                data: { data: [{ id: "msg_1" }, { id: "msg_2" }] },
                error: null,
            }),
        }
    }
    return { Resend: MockResend, default: { Resend: MockResend } }
})

describe("ResendService", () => {
    describe("sendEmail", () => {
        it("sends an email and returns a message ID", async () => {
            const result = await ResendService.sendEmail({
                apiKey: "re_test_key",
                from: "test@example.com",
                to: "recipient@example.com",
                subject: "Hello",
                html: "<p>Test</p>",
            })
            expect(result).toEqual({ id: "msg_test_123" })
        })
    })

    describe("sendBatch", () => {
        it("sends a batch of emails and returns IDs", async () => {
            const result = await ResendService.sendBatch({
                apiKey: "re_test_key",
                emails: [
                    { from: "a@b.com", to: "c@d.com", subject: "E1", html: "<p>1</p>" },
                    { from: "a@b.com", to: "e@f.com", subject: "E2", html: "<p>2</p>" },
                ],
            })
            expect(result.ids).toEqual(["msg_1", "msg_2"])
        })
    })

    describe("buildCampaignEmail", () => {
        it("personalizes the email template with prospect data", () => {
            const email = ResendService.buildCampaignEmail({
                senderName: "John Smith",
                senderDomain: "mybrand.com",
                recipientEmail: "prospect@law.com",
                subject: "Hello {{prospect_name}}",
                body: "<p>Dear {{prospect_name}}, I noticed {{company_name}} could use a website.</p>",
                prospectName: "Dr. Mueller",
                companyName: "Mueller Law",
                unsubscribeUrl: "https://mybrand.com/unsubscribe",
                physicalAddress: "123 Main St, Berlin, Germany",
            })

            expect(email.to).toBe("prospect@law.com")
            expect(email.from).toBe("John Smith <noreply@mybrand.com>")
            expect(email.subject).toBe("Hello Dr. Mueller")
            expect(email.html).toContain("Dear Dr. Mueller")
            expect(email.html).toContain("Mueller Law")
            expect(email.html).toContain("123 Main St, Berlin, Germany")
            expect(email.html).toContain("Unsubscribe")
        })

        it("includes campaign tags for tracking", () => {
            const email = ResendService.buildCampaignEmail({
                senderName: "Sales",
                senderDomain: "brand.com",
                recipientEmail: "test@test.com",
                subject: "Test",
                body: "<p>Test</p>",
                prospectName: "Test User",
                companyName: "Test Co",
                unsubscribeUrl: "https://brand.com/unsub",
                physicalAddress: "456 Oak Ave",
            })

            expect(email.tags).toEqual([
                { name: "campaign", value: "outreach" },
                { name: "prospect", value: "Test User" },
            ])
        })
    })
})
