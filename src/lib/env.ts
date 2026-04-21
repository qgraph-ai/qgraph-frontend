import { z } from "zod"

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
})

const parsed = PublicEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
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
