import { ensureCsrf } from "@/lib/api"
import { API_URL } from "@/lib/env"

import { AUTH_PATHS } from "./paths"

export type GoogleLoginTarget = {
  action: string
  csrfToken: string | null
}

export async function buildGoogleLoginFormTarget(): Promise<GoogleLoginTarget> {
  const csrfToken = await ensureCsrf()
  const action = `${API_URL}${AUTH_PATHS.googleLogin}`
  return { action, csrfToken }
}

