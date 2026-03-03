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
})

export type Env = z.infer<typeof envSchema>

export function checkEnvConfigs(): void {
  const envVars = Object.keys(envSchema.shape)
  const statusList = envVars.map((key) => {
    const isSecretObj = envSchema.shape[key as keyof typeof envSchema.shape]
    let isOptional = false
    if (isSecretObj instanceof z.ZodOptional) {
      isOptional = true
    }
    const val = process.env[key]
    const exists = val !== undefined && val !== ""

    return {
      Variable: key,
      Status: exists ? "✅ Set" : isOptional ? "⚠️ Optional" : "❌ Missing",
    }
  })

  const missingRequired = statusList.filter((item) => item.Status === "❌ Missing")

  if (missingRequired.length > 0) {
    console.log("\n=======================================================")
    console.log("⚠️  GEENIUS API: MISSING ENVIRONMENT CONFIGURATIONS")
    console.log("=======================================================")
    console.table(statusList)
    console.log("Running without full configuration. Some features will fail.")
    console.log("=======================================================\n")
    if (!process.env["PORT"]) {
      console.error("FATAL: PORT is absolutely required to boot.")
      process.exit(1)
    }
  } else {
    console.log("✅ All Geenius API environment configurations are set.")
  }
}

export const env = envSchema.partial().parse(process.env)
