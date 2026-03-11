import { expect, test } from "vitest"
import { convexTest } from "convex-test"
import { api } from "../convex/_generated/api.js"
import schema from "../convex/schema.js"
import { modules } from "./setup.js"

test("campaigns mutations and queries", async () => {
    const t = convexTest(schema, modules)

    // 1. Create a reseller user
    const resellerId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
            name: "Test Reseller",
            email: "reseller@example.com",
            convexUserId: "test_reseller_id",
            role: "reseller",
            createdAt: Date.now()
        })
    })

    const authed = t.withIdentity({
        tokenIdentifier: "test_reseller_id",
        subject: "test_reseller_id"
    })

    // 2. Create campaign
    const campaignId = await authed.mutation(api.campaigns.create, {
        name: "Test Campaign",
        niche: "Lawyers",
        location: "NYC",
        complianceMarket: "US",
        templateSubject: "Hello",
        templateBody: "World"
    })

    expect(campaignId).toBeDefined()

    // 3. Get campaign
    const campaign = await authed.query(api.campaigns.get, { id: campaignId })
    expect(campaign?.name).toBe("Test Campaign")
    expect(campaign?.status).toBe("draft")

    // 4. Update campaign & acknowledge compliance
    await authed.mutation(api.campaigns.update, {
        id: campaignId,
        complianceAcknowledged: true
    })

    const updated = await authed.query(api.campaigns.get, { id: campaignId })
    expect(updated?.complianceAcknowledged).toBe(true)

    // 5. Activate campaign
    await authed.mutation(api.campaigns.activate, { id: campaignId })
    const activated = await authed.query(api.campaigns.get, { id: campaignId })
    expect(activated?.status).toBe("active")

    // 6. List campaigns
    const list = await authed.query(api.campaigns.list, {})
    expect(list.length).toBe(1)
})
