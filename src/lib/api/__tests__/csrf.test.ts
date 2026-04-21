import { http, HttpResponse } from "msw"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"

import { CSRF_ENDPOINT, ensureCsrf, getCsrfFromCookie } from "../csrf"
import { server } from "../../../../tests/msw/server"

function clearCookies() {
  for (const cookie of document.cookie.split("; ")) {
    const name = cookie.split("=")[0]
    if (!name) continue
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}

describe("csrf", () => {
  beforeEach(() => {
    clearCookies()
  })

  afterEach(() => {
    clearCookies()
  })

  it("returns cookie value directly when csrftoken already present", async () => {
    document.cookie = "csrftoken=existing-token"
    const token = await ensureCsrf()
    expect(token).toBe("existing-token")
  })

  it("fetches and returns token from backend when cookie missing", async () => {
    let calls = 0
    server.use(
      http.get(`${API_URL}${CSRF_ENDPOINT}`, () => {
        calls += 1
        return HttpResponse.json({ csrfToken: "fresh-token" })
      })
    )
    const token = await ensureCsrf()
    expect(token).toBe("fresh-token")
    expect(calls).toBe(1)
  })

  it("dedupes concurrent calls into a single request", async () => {
    let calls = 0
    server.use(
      http.get(`${API_URL}${CSRF_ENDPOINT}`, async () => {
        calls += 1
        return HttpResponse.json({ csrfToken: "fresh-token" })
      })
    )
    const [a, b, c] = await Promise.all([ensureCsrf(), ensureCsrf(), ensureCsrf()])
    expect(calls).toBe(1)
    expect(a).toBe("fresh-token")
    expect(b).toBe("fresh-token")
    expect(c).toBe("fresh-token")
  })

  it("returns null when fetch fails", async () => {
    server.use(
      http.get(`${API_URL}${CSRF_ENDPOINT}`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    )
    const token = await ensureCsrf()
    expect(token).toBeNull()
  })

  it("reads cookie correctly via getCsrfFromCookie", () => {
    expect(getCsrfFromCookie()).toBeNull()
    document.cookie = "csrftoken=abc123"
    expect(getCsrfFromCookie()).toBe("abc123")
  })
})
