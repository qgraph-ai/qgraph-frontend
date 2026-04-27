import { describe, expect, it, vi } from "vitest"

import {
  mockGetExecution,
  mockGetResponse,
  mockSubmit,
} from "@/services/search/mocks/search-mocks"

describe("search mocks", () => {
  it("mockSubmit returns an async envelope with deterministic urls", () => {
    const envelope = mockSubmit({ query: "mercy" })
    expect(envelope.mode).toBe("async")
    expect(envelope.execution_status).toBe("pending")
    expect(envelope.poll_url).toBe(
      `/api/v1/search/executions/${envelope.execution_id}/`
    )
    expect(envelope.response_url).toBe(
      `/api/v1/search/executions/${envelope.execution_id}/response/`
    )
    expect(envelope.response).toBeNull()
    expect(envelope.guest_token).toBeTruthy()
  })

  it("mockGetExecution flips from pending to succeeded over simulated time", () => {
    vi.useFakeTimers({ now: 0 })
    try {
      const envelope = mockSubmit({ query: "ease" })
      const id = envelope.execution_id

      expect(mockGetExecution(id).status).toBe("pending")

      vi.setSystemTime(1_000)
      expect(mockGetExecution(id).status).toBe("running")

      vi.setSystemTime(5_000)
      expect(mockGetExecution(id).status).toBe("succeeded")
    } finally {
      vi.useRealTimers()
    }
  })

  it("mockGetResponse rejects with status 409 until the job is ready", () => {
    vi.useFakeTimers({ now: 0 })
    try {
      const envelope = mockSubmit({ query: "patience" })
      const id = envelope.execution_id

      try {
        mockGetResponse(id)
        expect.unreachable("should have thrown")
      } catch (err) {
        expect((err as { status?: number }).status).toBe(409)
      }

      vi.setSystemTime(5_000)
      const response = mockGetResponse(id)
      expect(response.render_schema_version).toBe("v1")
      expect(response.blocks.length).toBeGreaterThan(0)
      expect(response.blocks[0].block_type).toBe("text")
      expect(response.blocks[1].block_type).toBe("surah_distribution")
    } finally {
      vi.useRealTimers()
    }
  })

  it("mockGetResponse produces deterministic output for the same query", () => {
    vi.useFakeTimers({ now: 0 })
    try {
      const a = mockSubmit({ query: "deterministic" })
      const b = mockSubmit({ query: "deterministic" })
      vi.setSystemTime(5_000)
      const responseA = mockGetResponse(a.execution_id)
      const responseB = mockGetResponse(b.execution_id)
      const distA = (
        responseA.blocks[1].payload as {
          values: { surah: number; value: number }[]
        }
      ).values
      const distB = (
        responseB.blocks[1].payload as {
          values: { surah: number; value: number }[]
        }
      ).values
      expect(distA).toEqual(distB)
    } finally {
      vi.useRealTimers()
    }
  })

  it("mockGetResponse honors the surahs filter", () => {
    vi.useFakeTimers({ now: 0 })
    try {
      const envelope = mockSubmit({
        query: "filtered",
        filters: { surahs: [1, 2, 7] },
      })
      vi.setSystemTime(5_000)
      const response = mockGetResponse(envelope.execution_id)
      const distribution = (
        response.blocks[1].payload as {
          values: { surah: number; value: number }[]
        }
      ).values
      const surahs = distribution.map((entry) => entry.surah)
      expect(new Set(surahs)).toEqual(new Set([1, 2, 7]))
    } finally {
      vi.useRealTimers()
    }
  })
})
