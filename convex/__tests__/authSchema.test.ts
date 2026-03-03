/// <reference types="vite/client" />
import { describe, it, expect, vi } from "vitest"
import { convexTest } from "convex-test"
import { anyApi } from "convex/server"
import schema from "../schema"

describe("Convex Schema Validation", () => {
    it("should successfully insert a strict auth user object without crashing due to missing fields", async () => {
        // Spin up an isolated local Convex instance for testing schemas
        const t = convexTest(schema)

        // Attempt to manually perform the exact operation @convex-dev/auth attempts behind the scenes
        const mockAuthPayload = {
            name: "Mehdi Nabhani",
            email: "test@geenius.com",
            image: "https://avatar.com/123.png"
            // Missing entirely: convexUserId, stripeCustomerId, createdAt
        }

        // Attempt the underlying insert operation manually (via anyApi mutation to circumvent strict typing)
        const resultId = await t.run(async (ctx) => {
            // @ts-ignore
            return await ctx.db.insert("users", mockAuthPayload)
        })

        expect(resultId).toBeDefined()

        const insertedUser = await t.run(async (ctx) => {
            return await ctx.db.get(resultId as any)
        })

        expect((insertedUser as any)?.email).toBe("test@geenius.com")
    })
})
