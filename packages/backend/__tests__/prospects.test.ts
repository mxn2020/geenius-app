import { expect, test } from "vitest"
import { convexTest } from "convex-test"
import { api } from "../convex/_generated/api.js"
import schema from "../convex/schema.js"
import { modules } from "./setup.js"

test("prospects mutations and queries", async () => {
    const t = convexTest(schema, modules)

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

    // 1. Create a prospect
    await authed.mutation(api.prospects.create, {
        businessName: "Acme Corp",
        location: "NYC",
        niche: "Real Estate"
    })

    // 2. Bulk create prospects
    await authed.mutation(api.prospects.bulkCreate, {
        prospects: [
            { businessName: "Beta Corp", location: "LA", niche: "Real Estate" },
            { businessName: "Gamma Inc", location: "SF", niche: "Lawyers" }
        ]
    })

    // 3. List prospects
    const allProspects = await authed.query(api.prospects.list, {})
    expect(allProspects.length).toBe(3)

    // 4. Update status
    const prospectToUpdate = allProspects[0]
    await authed.mutation(api.prospects.updateStatus, {
        id: prospectToUpdate._id,
        status: "contacted"
    })

    // 5. List with filter
    const contactedProspects = await authed.query(api.prospects.list, { status: "contacted" })
    expect(contactedProspects.length).toBe(1)
    expect(contactedProspects[0]._id).toBe(prospectToUpdate._id)
})
