import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { CreateProjectSchema, PurchaseDomainSchema, UpdateAIModelSchema } from "@geenius/shared-validators"
import { z } from "zod"

export const projectsRouter = new Hono()

projectsRouter.get("/", async (c) => {
  return c.json({ projects: [] })
})

projectsRouter.post(
  "/",
  zValidator("json", CreateProjectSchema),
  async (c) => {
    const input = c.req.valid("json")
    return c.json({ ok: true, project: { ...input, id: crypto.randomUUID(), status: "creating", createdAt: Date.now() } }, 201)
  }
)

projectsRouter.get("/:id", async (c) => {
  const id = c.req.param("id")
  return c.json({ id, name: "placeholder", slug: "placeholder", plan: "website", status: "live", createdAt: Date.now() })
})

projectsRouter.delete("/:id", async (c) => {
  return c.json({ ok: true })
})

projectsRouter.get("/:id/jobs", async (c) => {
  return c.json({ jobs: [] })
})

projectsRouter.post(
  "/:id/domains",
  zValidator("json", PurchaseDomainSchema),
  async (c) => {
    const input = c.req.valid("json")
    return c.json({ ok: true, domain: { ...input, id: crypto.randomUUID(), status: "purchased", registrar: "namecheap", registrarDomainId: null, purchasePriceCents: 1200, renewalPriceCents: 1200, renewalDate: null } }, 201)
  }
)

projectsRouter.patch(
  "/:id/ai/model",
  zValidator("json", UpdateAIModelSchema),
  async (c) => {
    const input = c.req.valid("json")
    return c.json({ ok: true, model: input.model })
  }
)

projectsRouter.get("/:id/ai/allowance", async (c) => {
  const id = c.req.param("id")
  return c.json({
    id: crypto.randomUUID(),
    projectId: id,
    periodStart: Date.now(),
    periodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
    creditsGranted: 10000,
    creditsUsed: 0,
  })
})
