import { http, HttpResponse } from "msw"
import { afterEach, describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"
import { tokenStore } from "@/lib/api"
import {
  createSearchBookmark,
  createSearchFeedback,
  deleteSearchBookmark,
  getExecution,
  getExecutionResponse,
  listSearchBookmarks,
  SEARCH_GUEST_TOKEN_KEY,
  submitSearch,
} from "@/services/search"
import { SEARCH_PATHS } from "@/services/search/paths"

import { server } from "../../../../tests/msw/server"

const url = (path: string) => `${API_URL}${path}`

afterEach(() => {
  tokenStore.clearGuestToken(SEARCH_GUEST_TOKEN_KEY)
})

describe("submitSearch", () => {
  it("POSTs the canonical body shape and stores the guest token", async () => {
    let captured: unknown = null
    server.use(
      http.post(url(SEARCH_PATHS.submit), async ({ request }) => {
        captured = await request.json()
        return HttpResponse.json(
          {
            query_id: 1,
            execution_id: 42,
            execution_status: "queued",
            mode: "async",
            guest_token: "token-from-django",
            poll_url: "/api/v1/search/executions/42/",
            response_url: "/api/v1/search/executions/42/response/",
            response: null,
          },
          { status: 202 }
        )
      })
    )

    const envelope = await submitSearch({
      query: "mercy",
      filters: { surahs: [1, 2] },
    })

    expect(captured).toEqual({
      query: "mercy",
      filters: { surahs: [1, 2] },
      output_preferences: {},
    })
    expect(envelope.execution_id).toBe(42)
    expect(envelope.mode).toBe("async")
    expect(envelope.response).toBeNull()
    expect(tokenStore.getGuestToken(SEARCH_GUEST_TOKEN_KEY)).toBe(
      "token-from-django"
    )
  })

  it("defaults filters to {} when none are provided", async () => {
    let captured: unknown = null
    server.use(
      http.post(url(SEARCH_PATHS.submit), async ({ request }) => {
        captured = await request.json()
        return HttpResponse.json(
          {
            query_id: 1,
            execution_id: 7,
            execution_status: "succeeded",
            mode: "sync",
            poll_url: "/api/v1/search/executions/7/",
            response_url: "/api/v1/search/executions/7/response/",
            response: null,
          },
          { status: 201 }
        )
      })
    )

    await submitSearch({ query: "no filters" })
    expect(captured).toMatchObject({ filters: {} })
  })
})

describe("getExecution", () => {
  it("echoes the stored guest token as X-Search-Guest-Token", async () => {
    tokenStore.setGuestToken(SEARCH_GUEST_TOKEN_KEY, "guest-abc")
    let receivedHeader: string | null = null
    server.use(
      http.get(`${API_URL}/api/v1/search/executions/:id/`, ({ request }) => {
        receivedHeader = request.headers.get("x-search-guest-token")
        return HttpResponse.json({
          id: 99,
          query_id: 1,
          execution_number: 1,
          status: "running",
          mode: "async",
          started_at: null,
          completed_at: null,
          latency_ms: null,
          response_available: false,
          created_at: "2026-05-03T00:00:00Z",
          updated_at: "2026-05-03T00:00:00Z",
        })
      })
    )

    const summary = await getExecution("/api/v1/search/executions/99/")
    expect(summary.status).toBe("running")
    expect(receivedHeader).toBe("guest-abc")
  })

  it("omits the guest token header when none is stored", async () => {
    let hadHeader = true
    server.use(
      http.get(`${API_URL}/api/v1/search/executions/:id/`, ({ request }) => {
        hadHeader = request.headers.has("x-search-guest-token")
        return HttpResponse.json({
          id: 1,
          query_id: 1,
          execution_number: 1,
          status: "succeeded",
          mode: "async",
          started_at: null,
          completed_at: null,
          latency_ms: null,
          response_available: true,
          created_at: "2026-05-03T00:00:00Z",
          updated_at: "2026-05-03T00:00:00Z",
        })
      })
    )

    await getExecution("/api/v1/search/executions/1/")
    expect(hadHeader).toBe(false)
  })
})

describe("getExecutionResponse", () => {
  it("parses the response on 200", async () => {
    server.use(
      http.get(
        `${API_URL}/api/v1/search/executions/:id/response/`,
        () =>
          HttpResponse.json({
            id: 4824,
            execution: 1,
            title: "Hello",
            overall_confidence: 0.5,
            render_schema_version: "v1",
            metadata: {},
            blocks: [],
            created_at: "2026-05-03T00:00:00Z",
            updated_at: "2026-05-03T00:00:00Z",
          })
      )
    )
    const response = await getExecutionResponse(
      "/api/v1/search/executions/1/response/"
    )
    expect(response.title).toBe("Hello")
  })

  it("surfaces 409 as a NormalizedApiError with status 409", async () => {
    server.use(
      http.get(
        `${API_URL}/api/v1/search/executions/:id/response/`,
        () => HttpResponse.json({ detail: "not ready" }, { status: 409 })
      )
    )
    await expect(
      getExecutionResponse("/api/v1/search/executions/1/response/")
    ).rejects.toEqual(expect.objectContaining({ status: 409 }))
  })
})

describe("listSearchBookmarks", () => {
  it("unwraps a paginated response", async () => {
    server.use(
      http.get(url(SEARCH_PATHS.bookmarks), () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 1,
              response: 7,
              result_item: null,
              note: "first",
              created_at: "2026-05-03T00:00:00Z",
              updated_at: "2026-05-03T00:00:00Z",
            },
          ],
        })
      )
    )
    const bookmarks = await listSearchBookmarks()
    expect(bookmarks.length).toBe(1)
    expect(bookmarks[0].note).toBe("first")
  })

  it("accepts a bare array response", async () => {
    server.use(
      http.get(url(SEARCH_PATHS.bookmarks), () =>
        HttpResponse.json([
          {
            id: 2,
            response: 8,
            result_item: null,
            note: "bare",
            created_at: "2026-05-03T00:00:00Z",
            updated_at: "2026-05-03T00:00:00Z",
          },
        ])
      )
    )
    const bookmarks = await listSearchBookmarks()
    expect(bookmarks.length).toBe(1)
    expect(bookmarks[0].note).toBe("bare")
  })
})

describe("createSearchBookmark / deleteSearchBookmark", () => {
  it("creates a bookmark and deletes it", async () => {
    let deletedId: string | null = null
    server.use(
      http.delete(`${API_URL}/api/v1/search/bookmarks/:id/`, ({ params }) => {
        deletedId = String(params.id)
        return new HttpResponse(null, { status: 204 })
      })
    )
    const created = await createSearchBookmark({
      response_id: 42,
      note: "interesting",
    })
    expect(created.response).toBe(42)
    expect(created.note).toBe("interesting")

    await deleteSearchBookmark(created.id)
    expect(deletedId).toBe(String(created.id))
  })
})

describe("createSearchFeedback", () => {
  it("posts and returns the server payload", async () => {
    const feedback = await createSearchFeedback({
      feedback_type: "helpful",
      response_id: 123,
      comment: "nice",
    })
    expect(feedback.feedback_type).toBe("helpful")
    expect(feedback.response).toBe(123)
    expect(feedback.comment).toBe("nice")
  })

  it("posts even when optional fields are omitted", async () => {
    const feedback = await createSearchFeedback({
      feedback_type: "not_helpful",
      response_id: 1,
    })
    expect(feedback.feedback_type).toBe("not_helpful")
  })
})
