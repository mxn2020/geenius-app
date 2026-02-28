import { z } from "zod"

export const RESERVED_SLUGS = [
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "console",
  "dashboard",
  "docs",
  "geenius",
  "help",
  "login",
  "mail",
  "mobile",
  "new",
  "register",
  "settings",
  "signup",
  "status",
  "support",
  "web",
  "www",
]

export const SlugSchema = z
  .string()
  .min(3, "Slug must be at least 3 characters")
  .max(48, "Slug must be at most 48 characters")
  .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens")
  .refine((s) => !s.startsWith("-") && !s.endsWith("-"), "Slug cannot start or end with a hyphen")
  .refine((s) => !RESERVED_SLUGS.includes(s), "This slug is reserved")

export const CreateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  slug: SlugSchema,
  plan: z.enum(["website", "webapp", "authdb", "ai"]),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>

export const PurchaseDomainSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  domainName: z
    .string()
    .min(4, "Domain name is required")
    .regex(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/, "Invalid domain name format"),
})

export type PurchaseDomainInput = z.infer<typeof PurchaseDomainSchema>

export const UpdateAIModelSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  model: z.enum(["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet", "claude-3-haiku"]),
})

export type UpdateAIModelInput = z.infer<typeof UpdateAIModelSchema>
