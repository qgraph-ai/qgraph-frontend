import { ensureCsrf } from "@/lib/api"
import { API_URL } from "@/lib/env"

import { AUTH_PATHS } from "./paths"

export type GoogleLoginTarget = {
  action: string
  csrfToken: string | null
}

export async function buildGoogleLoginFormTarget(): Promise<GoogleLoginTarget> {
  console.info(
    `[auth-debug] service.buildGoogleLoginFormTarget: resolving CSRF before building Google OAuth form target.`
  )
  const csrfToken = await ensureCsrf()
  const action = `${API_URL}${AUTH_PATHS.googleLogin}`
  console.info(
    `[auth-debug] service.buildGoogleLoginFormTarget: action='${action}' csrfToken=${csrfToken ? "present" : "MISSING"}`
  )
  return {
    action,
    csrfToken,
  }
}
