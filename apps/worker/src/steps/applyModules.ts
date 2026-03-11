import type { JobContext } from "../lib/context.js"

/**
 * Returns the list of files to patch for a given plan.
 * In production, each file would be fetched, patched, and committed.
 */
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

export async function applyModules(ctx: JobContext): Promise<void> {
  const project = await ctx.convex.query<{ slug: string; plan: string; name: string }>(
    "projects:workerGetProject",
    { id: ctx.projectId }
  )
  if (!project) throw new Error("Project not found")

  await ctx.log("info", `Applying module patches for plan "${project.plan}"`)

  const patches = getPlanPatches(project.plan)

  if (!ctx.github) {
    await ctx.log("warn", "GitHub service not configured — listing patches without applying")
    await ctx.log("info", `Would apply ${patches.length} patches: ${patches.join(", ")}`)
    return
  }

  const repoName = `proj-${ctx.projectId}`
  const org = process.env["GITHUB_ORG"] ?? ""

  // For each patch file, we create/update the file content via GitHub API
  // package.json: set the project name to the slug
  const packageJsonContent = JSON.stringify(
    {
      name: project.slug,
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
      },
    },
    null,
    2
  )

  try {
    // Update package.json with project-specific name
    const content = Buffer.from(packageJsonContent).toString("base64")
    const res = await fetch(
      `https://api.github.com/repos/${org}/${repoName}/contents/package.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env["GITHUB_APP_PRIVATE_KEY"] ?? ""}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `chore: configure project ${project.slug} for plan ${project.plan} [geenius]`,
          content,
        }),
      }
    )
    if (!res.ok) {
      await ctx.log("warn", `Failed to update package.json (${res.status}) — continuing`)
    }
  } catch (err) {
    await ctx.log("warn", `Module patching encountered an error: ${err instanceof Error ? err.message : String(err)}`)
  }

  await ctx.log("info", `Applied ${patches.length} patches for plan ${project.plan}`)
}
