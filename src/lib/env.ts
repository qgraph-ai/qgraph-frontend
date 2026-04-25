import { z } from "zod"

const LOG_LEVELS = ["debug", "info", "warn", "error", "silent"] as const

const OptionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => value || undefined)
  .pipe(z.string().url().optional())

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url()
    .default("http://127.0.0.1:3000"),
  NEXT_PUBLIC_ENABLE_SENTRY: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  NEXT_PUBLIC_SENTRY_DSN: OptionalUrlSchema,
  NEXT_PUBLIC_LOG_LEVEL: z.enum(LOG_LEVELS).default("info"),
})

const parsed = PublicEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ENABLE_SENTRY: process.env.NEXT_PUBLIC_ENABLE_SENTRY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
})

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n")
  throw new Error(
    `Invalid public environment variables:\n${issues}\nSet them in .env.local or your deployment environment.`
  )
}

export const env = parsed.data
export const API_URL = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")
export const SITE_URL = env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "")
export type PublicLogLevel = (typeof LOG_LEVELS)[number]
