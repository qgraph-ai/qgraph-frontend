import { renderHook, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { afterEach, describe, expect, it } from "vitest"

import { useSearchResult } from "@/features/search/hooks/use-search-result"
import { API_URL } from "@/lib/env"
import { tokenStore } from "@/lib/api"
import {
  SEARCH_GUEST_TOKEN_KEY,
  type SearchSubmissionEnvelope,
} from "@/services/search"

import { server } from "../../../../../tests/msw/server"
import { TestProviders } from "../../../../../tests/test-utils"

const POLL_PATH = "/api/v1/search/executions/77/"
const RESPONSE_PATH = "/api/v1/search/executions/77/response/"

function asyncEnvelope(
  overrides: Partial<SearchSubmissionEnvelope> = {}
): SearchSubmissionEnvelope {
  return {
    query_id: 1,
    execution_id: 77,
    execution_status: "queued",
    mode: "async",
    guest_token: "guest-token-77",
    poll_url: POLL_PATH,
    response_url: RESPONSE_PATH,
    response: null,
    ...overrides,
  }
}

function executionPayload(status: string) {
  return {
    id: 77,
    query_id: 1,
    execution_number: 1,
    status,
    mode: "async",
    started_at: "2026-05-03T00:00:00Z",
    completed_at: null,
    latency_ms: null,
    response_available: status === "succeeded" || status === "partial",
    created_at: "2026-05-03T00:00:00Z",
    updated_at: "2026-05-03T00:00:00Z",
  }
}

function djangoResponse() {
  return {
    id: 4824,
    execution: 77,
    title: "Server payload",
    overall_confidence: 0.5,
    render_schema_version: "v1",
    metadata: {},
    blocks: [
      {
        id: 1,
        block_type: "text",
        order: 0,
        title: "Hello",
        payload: { details: "Body from Django." },
        explanation: "",
        confidence: null,
        provenance: {},
        warning_text: "",
        items: [],
      },
    ],
    created_at: "2026-05-03T00:00:00Z",
    updated_at: "2026-05-03T00:00:00Z",
  }
}

afterEach(() => {
  tokenStore.clearGuestToken(SEARCH_GUEST_TOKEN_KEY)
})

describe("useSearchResult (live)", () => {
  it("renders inline sync response without polling", async () => {
    let pollCalls = 0
    server.use(
      http.get(`${API_URL}${POLL_PATH}`, () => {
        pollCalls += 1
        return HttpResponse.json(executionPayload("succeeded"))
      })
    )
    const env = asyncEnvelope({
      execution_status: "succeeded",
      mode: "sync",
      response: {
        ...djangoResponse(),
        title: "Inline sync title",
      },
    })

    const { result } = renderHook(() => useSearchResult(env), {
      wrapper: TestProviders,
    })

    await waitFor(() => expect(result.current.phase).toBe("succeeded"))
    expect(result.current.response?.title).toBe("Inline sync title")
    expect(pollCalls).toBe(0)
  })

  it("polls until succeeded and then fetches the response", async () => {
    let pollCalls = 0
    server.use(
      http.get(`${API_URL}${POLL_PATH}`, () => {
        pollCalls += 1
        return HttpResponse.json(executionPayload("succeeded"))
      }),
      http.get(`${API_URL}${RESPONSE_PATH}`, () =>
        HttpResponse.json(djangoResponse())
      )
    )

    const { result } = renderHook(
      () => useSearchResult(asyncEnvelope({ execution_status: "queued" })),
      { wrapper: TestProviders }
    )

    await waitFor(
      () => expect(result.current.phase).toBe("succeeded"),
      { timeout: 4000 }
    )
    expect(pollCalls).toBeGreaterThanOrEqual(1)
    expect(result.current.response?.title).toBe("Server payload")
    expect(result.current.response?.blocks[0]?.payload).toMatchObject({
      details: "Body from Django.",
    })
  }, 10_000)

  it("retries the response fetch on 409 until it materializes", async () => {
    let responseCalls = 0
    server.use(
      http.get(`${API_URL}${POLL_PATH}`, () =>
        HttpResponse.json(executionPayload("succeeded"))
      ),
      http.get(`${API_URL}${RESPONSE_PATH}`, () => {
        responseCalls += 1
        if (responseCalls < 2) {
          return HttpResponse.json({ detail: "not ready" }, { status: 409 })
        }
        return HttpResponse.json(djangoResponse())
      })
    )

    const { result } = renderHook(
      () => useSearchResult(asyncEnvelope({ execution_status: "queued" })),
      { wrapper: TestProviders }
    )

    await waitFor(
      () => expect(result.current.phase).toBe("succeeded"),
      { timeout: 6000 }
    )
    expect(responseCalls).toBeGreaterThanOrEqual(2)
    expect(result.current.response?.title).toBe("Server payload")
  }, 10_000)

  it("transitions to failed when the execution terminates as failed without a response", async () => {
    server.use(
      http.get(`${API_URL}${POLL_PATH}`, () =>
        HttpResponse.json(executionPayload("failed"))
      )
    )

    const { result } = renderHook(
      () => useSearchResult(asyncEnvelope({ execution_status: "queued" })),
      { wrapper: TestProviders }
    )

    await waitFor(
      () => expect(result.current.phase).toBe("failed"),
      { timeout: 4000 }
    )
    expect(result.current.response).toBeNull()
  }, 10_000)

  it("echoes the stored guest token on the poll request", async () => {
    tokenStore.setGuestToken(SEARCH_GUEST_TOKEN_KEY, "guest-token-77")
    let receivedHeader: string | null = null
    server.use(
      http.get(`${API_URL}${POLL_PATH}`, ({ request }) => {
        receivedHeader = request.headers.get("x-search-guest-token")
        return HttpResponse.json(executionPayload("succeeded"))
      }),
      http.get(`${API_URL}${RESPONSE_PATH}`, () =>
        HttpResponse.json(djangoResponse())
      )
    )

    const { result } = renderHook(
      () => useSearchResult(asyncEnvelope({ execution_status: "queued" })),
      { wrapper: TestProviders }
    )

    await waitFor(
      () => expect(result.current.phase).toBe("succeeded"),
      { timeout: 4000 }
    )
    expect(receivedHeader).toBe("guest-token-77")
  }, 10_000)
})
