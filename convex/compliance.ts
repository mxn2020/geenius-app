import { query, mutation, internalMutation } from "./_generated/server"
import { v } from "convex/values"

// ─── Queries ─────────────────────────────────────────
export const getRulesForMarket = query({
    args: {
        market: v.union(
            v.literal("EU"), v.literal("US"),
            v.literal("UK"), v.literal("DACH")
        ),
    },
    handler: async (ctx, args) => {
        return ctx.db
            .query("compliance_rules")
            .withIndex("by_market", (q) => q.eq("market", args.market))
            .collect()
    },
})

// ─── Seed Data ───────────────────────────────────────
const COMPLIANCE_DATA = [
    // EU (GDPR)
    { market: "EU" as const, ruleName: "Explicit Opt-In", description: "Recipients must have given explicit prior consent to receive marketing emails. Pre-checked boxes do not constitute valid consent.", severity: "critical" as const },
    { market: "EU" as const, ruleName: "Right to Erasure", description: "Recipients can request deletion of all their personal data at any time. You must comply within 30 days.", severity: "critical" as const },
    { market: "EU" as const, ruleName: "Unsubscribe Link", description: "Every marketing email must contain a clearly visible unsubscribe link.", severity: "critical" as const },
    { market: "EU" as const, ruleName: "Data Processing Agreement", description: "A DPA must be in place with any third-party email service provider processing personal data.", severity: "warning" as const },
    { market: "EU" as const, ruleName: "Sender Identification", description: "The sender must be clearly identifiable in the email header and footer.", severity: "info" as const },

    // US (CAN-SPAM)
    { market: "US" as const, ruleName: "Physical Address", description: "Every commercial email must include the sender's valid physical postal address.", severity: "critical" as const },
    { market: "US" as const, ruleName: "Opt-Out Mechanism", description: "Recipients must be able to opt out, and opt-out requests must be honored within 10 business days.", severity: "critical" as const },
    { market: "US" as const, ruleName: "No Misleading Headers", description: "The From, To, Reply-To, and routing information must be accurate and identify the sender.", severity: "critical" as const },
    { market: "US" as const, ruleName: "Subject Line Accuracy", description: "Subject lines must not be deceptive and must reflect the content of the message.", severity: "warning" as const },
    { market: "US" as const, ruleName: "Commercial Intent Label", description: "If the email is an advertisement, this must be clearly disclosed.", severity: "info" as const },

    // UK (PECR)
    { market: "UK" as const, ruleName: "Consent for Marketing", description: "Prior consent is required for sending unsolicited marketing emails to individuals.", severity: "critical" as const },
    { market: "UK" as const, ruleName: "Soft Opt-In Exception", description: "You may email existing customers about similar products/services without explicit consent if they were given opt-out opportunity at collection.", severity: "info" as const },
    { market: "UK" as const, ruleName: "ICO Registration", description: "Organizations processing personal data for marketing must register with the Information Commissioner's Office.", severity: "warning" as const },
    { market: "UK" as const, ruleName: "Unsubscribe Mechanism", description: "Every marketing email must include a simple way to opt out of future messages.", severity: "critical" as const },

    // DACH (UWG §7)
    { market: "DACH" as const, ruleName: "Prior Express Consent", description: "Sending commercial emails requires prior express consent from the recipient (§7 UWG). This applies to both B2B and B2C.", severity: "critical" as const },
    { market: "DACH" as const, ruleName: "Double Opt-In Recommended", description: "German courts strongly recommend double opt-in as proof of consent. Single opt-in may not hold up in disputes.", severity: "warning" as const },
    { market: "DACH" as const, ruleName: "No Cold B2C Email", description: "Cold emailing to consumers (B2C) without prior consent is strictly prohibited under German law.", severity: "critical" as const },
    { market: "DACH" as const, ruleName: "Impressum Required", description: "All commercial emails must include a valid Impressum (legal notice) with company name, address, and managing director.", severity: "critical" as const },
    { market: "DACH" as const, ruleName: "B2B Limited Exception", description: "B2B cold email may be permissible if the recipient has a presumed interest, but this is highly contested in court and carries risk.", severity: "warning" as const },
]

export const seedRules = mutation({
    args: {},
    handler: async (ctx) => {
        // Clear existing rules
        const existing = await ctx.db.query("compliance_rules").collect()
        for (const rule of existing) {
            await ctx.db.delete(rule._id)
        }
        // Insert fresh data
        for (const rule of COMPLIANCE_DATA) {
            await ctx.db.insert("compliance_rules", {
                ...rule,
                updatedAt: Date.now(),
            })
        }
        return `Seeded ${COMPLIANCE_DATA.length} compliance rules.`
    },
})
