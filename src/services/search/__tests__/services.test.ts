import { describe, expect, it, vi } from "vitest"

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

describe("search service (mock dispatch)", () => {
  it("submitSearch returns a mock envelope and stores the guest token", async () => {
    tokenStore.clearGuestToken(SEARCH_GUEST_TOKEN_KEY)
    const envelope = await submitSearch({
      query: "service mocks",
      filters: { surahs: [1, 2] },
    })
    expect(envelope.execution_id).toBeGreaterThan(0)
    expect(envelope.mode).toBe("async")
    expect(envelope.poll_url).toContain("/executions/")
    expect(envelope.response).toBeNull()
    expect(tokenStore.getGuestToken(SEARCH_GUEST_TOKEN_KEY)).toBe(
      envelope.guest_token
    )
    tokenStore.clearGuestToken(SEARCH_GUEST_TOKEN_KEY)
  })

  it("getExecution polls the mock and getExecutionResponse returns once succeeded", async () => {
    vi.useFakeTimers({ now: 0 })
    try {
      const envelope = await submitSearch({ query: "polling path" })

      const polled = await getExecution(envelope.poll_url)
      expect(polled.status).toBe("pending")

      vi.setSystemTime(5_000)
      const response = await getExecutionResponse(envelope.response_url)
      expect(response.blocks.length).toBe(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it("getExecutionResponse rejects with status 409 while still pending", async () => {
    vi.useFakeTimers({ now: 0 })
    try {
      const envelope = await submitSearch({ query: "still pending" })
      await expect(getExecutionResponse(envelope.response_url)).rejects.toEqual(
        expect.objectContaining({ status: 409 })
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it("getExecution rejects on unparseable url", async () => {
    await expect(getExecution("/does-not-match")).rejects.toBeInstanceOf(Error)
  })

  it("createSearchBookmark stores a bookmark and listSearchBookmarks returns it", async () => {
    const before = await listSearchBookmarks()
    const created = await createSearchBookmark({
      response_id: 42,
      note: "interesting",
    })
    expect(created.response).toBe(42)
    expect(created.note).toBe("interesting")

    const after = await listSearchBookmarks()
    expect(after.length).toBe(before.length + 1)
    expect(after.find((b) => b.id === created.id)).toBeTruthy()

    await deleteSearchBookmark(created.id)
    const cleaned = await listSearchBookmarks()
    expect(cleaned.find((b) => b.id === created.id)).toBeUndefined()
  })

  it("deleteSearchBookmark is a no-op on unknown ids", async () => {
    await expect(deleteSearchBookmark(9999999)).resolves.toBeUndefined()
  })

  it("createSearchFeedback returns a fake feedback record", async () => {
    const feedback = await createSearchFeedback({
      feedback_type: "helpful",
      response_id: 123,
      comment: "nice",
    })
    expect(feedback.feedback_type).toBe("helpful")
    expect(feedback.response).toBe(123)
    expect(feedback.comment).toBe("nice")
  })

  it("createSearchFeedback fills defaults when fields are omitted", async () => {
    const feedback = await createSearchFeedback({
      feedback_type: "not_helpful",
      response_id: 1,
    })
    expect(feedback.comment).toBe("")
    expect(feedback.metadata).toEqual({})
  })
})
