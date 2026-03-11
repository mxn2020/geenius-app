import { z } from "zod"

const envSchema = z.object({
    PORT: z.string().default("3001"),
    CONVEX_URL: z.string().url(),
    GITHUB_ORG: z.string(),
    GITHUB_APP_ID: z.string(),
    GITHUB_APP_PRIVATE_KEY: z.string(),
    VERCEL_API_TOKEN: z.string(),
    VERCEL_TEAM_ID: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validate environment variables on startup.
 * Throws if required variables are missing — crash-fast behaviour.
 */
export function validateEnv(): Env {
    try {
        return envSchema.parse(process.env)
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error("\n=======================================================")
            console.error("⚠️  GEENIUS WORKER: MISSING ENVIRONMENT CONFIGURATIONS")
            console.error("=======================================================")
            for (const issue of e.issues) {
                console.error(`  ❌ ${issue.path.join(".")}: ${issue.message}`)
            }
            console.error("=======================================================\n")
        }
        throw e
    }
}

export const env = validateEnv()
