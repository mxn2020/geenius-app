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
        console.log("⚠️  GEENIUS WORKER: MISSING ENVIRONMENT CONFIGURATIONS")
        console.log("=======================================================")
        console.table(statusList)
        console.log("Running without full configuration. Some background jobs will fail.")
        console.log("=======================================================\n")
        if (!process.env["PORT"]) {
            console.error("FATAL: PORT is absolutely required to boot worker.")
            process.exit(1)
        }
    } else {
        console.log("✅ All Geenius Worker environment configurations are set.")
    }
}

export const env = envSchema.partial().parse(process.env)
