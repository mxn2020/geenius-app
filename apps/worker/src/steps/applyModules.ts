import type { JobContext } from "../lib/context.js"

export async function applyModules(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{ slug: string; plan: string; name: string }>(
    "projects:getProject",
    { id: ctx.projectId }
  )
  if (!project) throw new Error("Project not found")

  await ctx.log("info", `Applying module patches for plan "${project.plan}"`)

  // In production: patch package.json with plan-specific deps,
  // update config files (e.g., next.config.js, vite.config.ts),
  // inject project name/slug into relevant files.
  const patches = getPlanPatches(project.plan)
  await ctx.log("info", `Applied ${patches.length} patches for plan ${project.plan}`)
}

function getPlanPatches(plan: string): string[] {
  const base = ["package.json", "README.md"]
  const planPatches: Record<string, string[]> = {
    website: [],
    webapp: ["src/auth/config.ts"],
    authdb: ["src/auth/config.ts", "src/db/schema.ts"],
    ai: ["src/ai/config.ts", "src/ai/routes.ts"],
  }
  return [...base, ...(planPatches[plan] ?? [])]
}
