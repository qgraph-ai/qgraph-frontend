import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useSearchFeedback } from "@/features/search/hooks/use-search-feedback"

import { TestProviders } from "../../../../../tests/test-utils"

describe("useSearchFeedback", () => {
  it("submits feedback through the mock layer", async () => {
    const { result } = renderHook(() => useSearchFeedback(), {
      wrapper: TestProviders,
    })

    await act(async () => {
      result.current.mutate({
        feedback_type: "helpful",
        response_id: 5,
      })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.feedback_type).toBe("helpful")
    expect(result.current.data?.response).toBe(5)
  })
})
