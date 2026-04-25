import { sanitizeReturnTo } from "./sanitize-return-to"

const POST_AUTH_RETURN_TO_KEY = "qgraph_post_auth_return_to"

function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function setPostAuthReturnTo(path: string): void {
  if (!isBrowser()) return

  const safe = sanitizeReturnTo(path)
  if (safe === "/" || safe.startsWith("/auth/")) {
    window.sessionStorage.removeItem(POST_AUTH_RETURN_TO_KEY)
    return
  }

  window.sessionStorage.setItem(POST_AUTH_RETURN_TO_KEY, safe)
}

export function consumePostAuthReturnTo(fallback = "/"): string {
  if (!isBrowser()) return fallback

  const raw = window.sessionStorage.getItem(POST_AUTH_RETURN_TO_KEY)
  window.sessionStorage.removeItem(POST_AUTH_RETURN_TO_KEY)

  const safe = sanitizeReturnTo(raw, fallback)
  if (safe.startsWith("/auth/")) return fallback
  return safe
}

