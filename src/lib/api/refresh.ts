import { CSRF_HEADER_NAME, ensureCsrf } from "./csrf"
import { API_URL } from "@/lib/env"
import { logger } from "@/lib/observability/logger"

export const REFRESH_ENDPOINT = "/api/auth/jwt/refresh/"

type Subscriber = (ok: boolean) => void

let inflight: Promise<boolean> | null = null
let subscribers: Subscriber[] = []

async function doRefresh(): Promise<boolean> {
  const url = `${API_URL}${REFRESH_ENDPOINT}`
  try {
    const csrf = await ensureCsrf()

    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { [CSRF_HEADER_NAME]: csrf } : {}),
      },
    })
    if (!res.ok) {
      logger.warn("JWT refresh returned non-OK response", {
        status: res.status,
      })
    }
    return res.ok
  } catch (err) {
    logger.error("JWT refresh request failed", err)
    return false
  }
}

export function refreshAccessToken(): Promise<boolean> {
  if (inflight) {
    return new Promise((resolve) => {
      subscribers.push(resolve)
    })
  }

  inflight = doRefresh().then((ok) => {
    const pending = subscribers
    subscribers = []
    for (const cb of pending) cb(ok)
    inflight = null
    return ok
  })

  return inflight
}
