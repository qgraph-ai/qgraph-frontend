import { API_URL } from "@/lib/env"
import { logger } from "@/lib/observability/logger"

export const CSRF_COOKIE_NAME = "csrftoken"
export const CSRF_HEADER_NAME = "X-CSRFToken"
export const CSRF_ENDPOINT = "/api/auth/csrf/"

export function getCsrfFromCookie(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CSRF_COOKIE_NAME}=`))
  if (!match) return null
  const value = match.slice(CSRF_COOKIE_NAME.length + 1)
  return value ? decodeURIComponent(value) : null
}

let inflight: Promise<string | null> | null = null

export function ensureCsrf(): Promise<string | null> {
  const existing = getCsrfFromCookie()
  if (existing) return Promise.resolve(existing)
  if (inflight) return inflight

  const url = `${API_URL}${CSRF_ENDPOINT}`

  inflight = fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  })
    .then(async (res) => {
      if (!res.ok) {
        logger.warn("CSRF bootstrap returned non-OK response", {
          status: res.status,
        })
        return getCsrfFromCookie()
      }
      const data = (await res.json().catch(() => null)) as
        | { csrfToken?: string }
        | null
      const fromBody = data?.csrfToken ?? null
      const fromCookie = getCsrfFromCookie()
      return fromBody ?? fromCookie
    })
    .catch((err) => {
      logger.error("CSRF bootstrap request failed", err)
      return null
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}
