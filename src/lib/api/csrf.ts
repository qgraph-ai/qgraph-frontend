import { API_URL } from "@/lib/env"

export const CSRF_COOKIE_NAME = "csrftoken"
export const CSRF_HEADER_NAME = "X-CSRFToken"
export const CSRF_ENDPOINT = "/api/auth/csrf/"

export function getCsrfFromCookie(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CSRF_COOKIE_NAME}=`))
  if (!match) {
    console.info(
      `[auth-debug] getCsrfFromCookie: no '${CSRF_COOKIE_NAME}' cookie present. document.cookie='${document.cookie}'`
    )
    return null
  }
  const value = match.slice(CSRF_COOKIE_NAME.length + 1)
  const decoded = value ? decodeURIComponent(value) : null
  console.info(
    `[auth-debug] getCsrfFromCookie: found '${CSRF_COOKIE_NAME}' cookie (len=${decoded?.length ?? 0})`
  )
  return decoded
}

let inflight: Promise<string | null> | null = null

export function ensureCsrf(): Promise<string | null> {
  const existing = getCsrfFromCookie()
  if (existing) {
    console.info(
      "[auth-debug] ensureCsrf: cookie already present, skipping GET /api/auth/csrf/"
    )
    return Promise.resolve(existing)
  }
  if (inflight) {
    console.info(
      "[auth-debug] ensureCsrf: inflight GET /api/auth/csrf/ exists, awaiting it"
    )
    return inflight
  }

  const url = `${API_URL}${CSRF_ENDPOINT}`
  console.info(
    `[auth-debug] ensureCsrf: → GET ${url} (credentials: include). Expecting 200 + Set-Cookie: ${CSRF_COOKIE_NAME}=…`
  )
  const startedAt = performance.now()

  inflight = fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  })
    .then(async (res) => {
      const ms = Math.round(performance.now() - startedAt)
      console.info(
        `[auth-debug] ensureCsrf: ← GET ${url} status=${res.status} in ${ms}ms`
      )
      if (!res.ok) {
        console.warn(
          `[auth-debug] ensureCsrf: non-OK response (${res.status}); falling back to reading cookie`
        )
        return getCsrfFromCookie()
      }
      const data = (await res.json().catch(() => null)) as
        | { csrfToken?: string }
        | null
      const fromBody = data?.csrfToken ?? null
      const fromCookie = getCsrfFromCookie()
      console.info(
        `[auth-debug] ensureCsrf: body.csrfToken=${fromBody ? "present" : "MISSING"}, cookie=${fromCookie ? "present" : "MISSING"}`
      )
      return fromBody ?? fromCookie
    })
    .catch((err) => {
      console.error("[auth-debug] ensureCsrf: fetch threw", err)
      return null
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}
