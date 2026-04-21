import { CSRF_HEADER_NAME, ensureCsrf } from "./csrf"
import { API_URL } from "@/lib/env"

export const REFRESH_ENDPOINT = "/api/auth/jwt/refresh/"

type Subscriber = (ok: boolean) => void

let inflight: Promise<boolean> | null = null
let subscribers: Subscriber[] = []

async function doRefresh(): Promise<boolean> {
  const url = `${API_URL}${REFRESH_ENDPOINT}`
  try {
    console.info(
      `[auth-debug] refresh: resolving CSRF before POST ${url}`
    )
    const csrf = await ensureCsrf()
    console.info(
      `[auth-debug] refresh: → POST ${url} (credentials: include, ${CSRF_HEADER_NAME}=${csrf ? "present" : "MISSING"}). Expecting 200 + fresh access-cookie.`
    )
    const startedAt = performance.now()
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { [CSRF_HEADER_NAME]: csrf } : {}),
      },
    })
    const ms = Math.round(performance.now() - startedAt)
    console.info(
      `[auth-debug] refresh: ← POST ${url} status=${res.status} ok=${res.ok} in ${ms}ms`
    )
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "")
      console.warn(
        `[auth-debug] refresh: non-OK body (truncated 500): ${bodyText.slice(0, 500)}`
      )
    }
    return res.ok
  } catch (err) {
    console.error("[auth-debug] refresh: fetch threw", err)
    return false
  }
}

export function refreshAccessToken(): Promise<boolean> {
  if (inflight) {
    console.info(
      "[auth-debug] refreshAccessToken: inflight refresh exists, queueing subscriber"
    )
    return new Promise((resolve) => {
      subscribers.push(resolve)
    })
  }

  console.info("[auth-debug] refreshAccessToken: starting new refresh")
  inflight = doRefresh().then((ok) => {
    const pending = subscribers
    subscribers = []
    console.info(
      `[auth-debug] refreshAccessToken: refresh completed ok=${ok}, notifying ${pending.length} subscriber(s)`
    )
    for (const cb of pending) cb(ok)
    inflight = null
    return ok
  })

  return inflight
}
