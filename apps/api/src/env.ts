import { z } from "zod"

const envSchema = z.object({
  PORT: z.string().default("3000"),
  CONVEX_URL: z.string().url(),
  CONVEX_AUTH_SECRET: z.string(),
  GITHUB_ORG: z.string(),
  GITHUB_APP_ID: z.string(),
  GITHUB_APP_PRIVATE_KEY: z.string(),
  VERCEL_API_TOKEN: z.string(),
  VERCEL_TEAM_ID: z.string().optional(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_PRICE_WEBSITE: z.string(),
  STRIPE_PRICE_WEBAPP: z.string(),
  STRIPE_PRICE_AUTHDB: z.string(),
  STRIPE_PRICE_AI: z.string(),
  NAMECHEAP_API_USER: z.string(),
  NAMECHEAP_API_KEY: z.string(),
  NAMECHEAP_CLIENT_IP: z.string(),
  ENCRYPTION_KEY: z.string(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  WORKER_QUEUE_URL: z.string().url(),
  WORKER_SECRET: z.string().optional(),
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
      console.error("⚠️  GEENIUS API: MISSING ENVIRONMENT CONFIGURATIONS")
      console.error("=======================================================")
      for (const issue of e.issues) {
        console.error(`  ❌ ${issue.path.join(".")}: ${issue.message}`)
      }
      console.error("=======================================================\n")
    }
    throw e
  }
}

// Parse env — required vars will cause startup crash if missing
export const env = validateEnv()
