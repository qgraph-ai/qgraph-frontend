import { http, HttpResponse } from "msw"
import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"

import { apiClient } from "../client"
import { server } from "../../../../tests/msw/server"

function clearCookies() {
  for (const cookie of document.cookie.split("; ")) {
    const name = cookie.split("=")[0]
    if (!name) continue
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}

const PROTECTED_PATH = "/api/v1/protected/"

describe("apiClient 401 refresh", () => {
  beforeEach(() => {
    clearCookies()
    document.cookie = "csrftoken=test-csrf"
  })

  afterEach(() => {
    clearCookies()
  })

  it("runs refresh once for a 401 and retries the original request", async () => {
    let refreshCalls = 0
    let protectedCalls = 0
    server.use(
      http.get(`${API_URL}${PROTECTED_PATH}`, () => {
        protectedCalls += 1
        if (protectedCalls === 1) {
          return HttpResponse.json({ detail: "unauthenticated" }, { status: 401 })
        }
        return HttpResponse.json({ ok: true })
      }),
      http.post(`${API_URL}/api/auth/jwt/refresh/`, () => {
        refreshCalls += 1
        return HttpResponse.json({}, { status: 200 })
      })
    )

    const response = await apiClient.get(PROTECTED_PATH)
    expect(response.data).toEqual({ ok: true })
    expect(refreshCalls).toBe(1)
    expect(protectedCalls).toBe(2)
  })

  it("dedupes refresh across concurrent 401s", async () => {
    let refreshCalls = 0
    const seenByUrl = new Map<string, number>()
    server.use(
      http.get(`${API_URL}${PROTECTED_PATH}`, ({ request }) => {
        const key = new URL(request.url).search
        const n = (seenByUrl.get(key) ?? 0) + 1
        seenByUrl.set(key, n)
        if (n === 1) {
          return HttpResponse.json({ detail: "unauth" }, { status: 401 })
        }
        return HttpResponse.json({ ok: true, key })
      }),
      http.post(`${API_URL}/api/auth/jwt/refresh/`, async () => {
        refreshCalls += 1
        await new Promise((r) => setTimeout(r, 20))
        return HttpResponse.json({}, { status: 200 })
      })
    )

    const results = await Promise.all([
      apiClient.get(`${PROTECTED_PATH}?a=1`),
      apiClient.get(`${PROTECTED_PATH}?a=2`),
      apiClient.get(`${PROTECTED_PATH}?a=3`),
    ])

    expect(refreshCalls).toBe(1)
    expect(results.map((r) => r.data.ok)).toEqual([true, true, true])
  })

  it("rejects the original request when refresh fails", async () => {
    server.use(
      http.get(`${API_URL}${PROTECTED_PATH}`, () =>
        HttpResponse.json({ detail: "unauth" }, { status: 401 })
      ),
      http.post(`${API_URL}/api/auth/jwt/refresh/`, () =>
        HttpResponse.json({ detail: "invalid" }, { status: 401 })
      )
    )

    await expect(apiClient.get(PROTECTED_PATH)).rejects.toMatchObject({
      status: 401,
    })
  })

  it("does not loop-refresh on auth endpoint 401s", async () => {
    let refreshCalls = 0
    server.use(
      http.post(`${API_URL}/api/auth/jwt/create/`, () =>
        HttpResponse.json({ detail: "bad creds" }, { status: 401 })
      ),
      http.post(`${API_URL}/api/auth/jwt/refresh/`, () => {
        refreshCalls += 1
        return HttpResponse.json({}, { status: 200 })
      })
    )

    await expect(
      apiClient.post("/api/auth/jwt/create/", {
        email: "u@e.com",
        password: "x",
      })
    ).rejects.toMatchObject({ status: 401 })
    expect(refreshCalls).toBe(0)
  })
})
