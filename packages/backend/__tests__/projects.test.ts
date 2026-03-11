import { expect, test } from "vitest"
import { convexTest } from "convex-test"
import { api } from "../convex/_generated/api.js"
import schema from "../convex/schema.js"
import { modules } from "./setup.js"

// Note: Ensure setup.js exports `modules` from `import.meta.glob("../**/*.*s")`
// like the convex-test documentation suggests

test("projects mutations and queries", async () => {
    const t = convexTest(schema, modules)

    // 1. Create a user manually to bypass auth for this test setup
    const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
            name: "Test User",
            email: "test@example.com",
            convexUserId: "test_convex_id",
            role: "user",
            createdAt: Date.now()
        })
    })

    // Start an authenticated session acting as 'test_convex_id'
    const authed = t.withIdentity({
        tokenIdentifier: "test_convex_id",
        subject: "test_convex_id"
    })

    // 2. Test createProject
    const newProjectId = await authed.mutation(api.projects.createProject, {
        name: "My Test Project",
        slug: "my-test-project",
        plan: "website"
    })

    expect(newProjectId).toBeDefined()

    // 3. Prevent duplicate slugs
    await expect(authed.mutation(api.projects.createProject, {
        name: "My Duplicate Project",
        slug: "my-test-project", // same slug
        plan: "website"
    })).rejects.toThrow("Slug already taken")

    // 4. Test getProject
    const project = await authed.query(api.projects.getProject, { id: newProjectId })
    expect(project).toBeDefined()
    expect(project?.name).toBe("My Test Project")
    expect(project?.status).toBe("creating")

    // 5. Test updateProjectStatus
    await t.mutation(api.projects.updateProjectStatus, {
        id: newProjectId,
        status: "live"
    })

    const updatedProject = await authed.query(api.projects.getProject, { id: newProjectId })
    expect(updatedProject?.status).toBe("live")

    // 6. Test listProjects
    const projects = await authed.query(api.projects.listProjects, {})
    expect(projects.length).toBe(1)
    expect(projects[0].slug).toBe("my-test-project")
})
