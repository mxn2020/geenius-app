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
  WORKER_QUEUE_URL: z.string().url(),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format())
    process.exit(1)
  }
  return result.data
}

export const env = envSchema.partial().parse(process.env)
