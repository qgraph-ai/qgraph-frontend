import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useSearchResult } from "@/features/search/hooks/use-search-result"
import type { SearchSubmissionEnvelope } from "@/services/search"

import { TestProviders } from "../../../../../tests/test-utils"

function envelope(
  overrides: Partial<SearchSubmissionEnvelope> = {}
): SearchSubmissionEnvelope {
  return {
    query_id: 1,
    execution_id: 1,
    execution_status: "pending",
    mode: "async",
    poll_url: "/api/v1/search/executions/1/",
    response_url: "/api/v1/search/executions/1/response/",
    response: null,
    ...overrides,
  }
}

describe("useSearchResult", () => {
  it("reports idle when given no envelope", () => {
    const { result } = renderHook(() => useSearchResult(null), {
      wrapper: TestProviders,
    })
    expect(result.current.phase).toBe("idle")
    expect(result.current.response).toBeNull()
  })

  it("returns succeeded immediately when the envelope already carries the response", async () => {
    const env = envelope({
      execution_status: "succeeded",
      response: {
        id: 42,
        execution: 1,
        title: "Inline",
        overall_confidence: null,
        render_schema_version: "v1",
        metadata: {},
        blocks: [],
        created_at: "2026-04-26T10:00:00Z",
        updated_at: "2026-04-26T10:00:00Z",
      },
    })
    const { result } = renderHook(() => useSearchResult(env), {
      wrapper: TestProviders,
    })
    await waitFor(() => expect(result.current.phase).toBe("succeeded"))
    expect(result.current.response?.id).toBe(42)
  })

  it("reports failed when the envelope status is failed", async () => {
    const env = envelope({ execution_status: "failed" })
    const { result } = renderHook(() => useSearchResult(env), {
      wrapper: TestProviders,
    })
    await waitFor(() => expect(result.current.phase).toBe("failed"))
  })

  it("reports canceled when the envelope status is canceled", async () => {
    const env = envelope({ execution_status: "canceled" })
    const { result } = renderHook(() => useSearchResult(env), {
      wrapper: TestProviders,
    })
    await waitFor(() => expect(result.current.phase).toBe("canceled"))
  })

  it("reports partial when the envelope is partial with a response", async () => {
    const env = envelope({
      execution_status: "partial",
      response: {
        id: 7,
        execution: 1,
        title: "Some",
        overall_confidence: null,
        render_schema_version: "v1",
        metadata: {},
        blocks: [],
        created_at: "2026-04-26T10:00:00Z",
        updated_at: "2026-04-26T10:00:00Z",
      },
    })
    const { result } = renderHook(() => useSearchResult(env), {
      wrapper: TestProviders,
    })
    await waitFor(() => expect(result.current.phase).toBe("partial"))
  })
})
