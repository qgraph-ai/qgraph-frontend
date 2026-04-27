import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useSearchSubmit } from "@/features/search/hooks/use-search-submit"

import { TestProviders } from "../../../../../tests/test-utils"

describe("useSearchSubmit", () => {
  it("populates data with the mock envelope after a successful submission", async () => {
    const { result } = renderHook(() => useSearchSubmit(), {
      wrapper: TestProviders,
    })

    await act(async () => {
      result.current.mutate({ query: "hooks pls" })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.execution_id).toBeGreaterThan(0)
    expect(result.current.data?.mode).toBe("async")
  })
})
