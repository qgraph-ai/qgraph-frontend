import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock("@/features/auth/use-auth", () => ({
  useAuth: useAuthMock,
}))

import {
  useSearchBookmarks,
  useToggleResponseBookmark,
} from "@/features/search/hooks/use-search-bookmarks"

import { TestProviders } from "../../../../../tests/test-utils"

describe("useSearchBookmarks", () => {
  beforeEach(() => {
    useAuthMock.mockReset()
  })

  it("does not fetch when the user is unauthenticated", () => {
    useAuthMock.mockReturnValue({ status: "unauthenticated", user: null })

    const { result } = renderHook(() => useSearchBookmarks(), {
      wrapper: TestProviders,
    })

    expect(result.current.fetchStatus).toBe("idle")
    expect(result.current.data).toBeUndefined()
  })

  it("returns an empty list for an authenticated user with no bookmarks yet", async () => {
    useAuthMock.mockReturnValue({
      status: "authenticated",
      user: { email: "u@example.com" },
    })

    const { result } = renderHook(() => useSearchBookmarks(), {
      wrapper: TestProviders,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(Array.isArray(result.current.data)).toBe(true)
  })
})

describe("useToggleResponseBookmark", () => {
  beforeEach(() => {
    useAuthMock.mockReset()
  })

  it("toggles a bookmark create then delete and fires the matching callbacks", async () => {
    useAuthMock.mockReturnValue({
      status: "authenticated",
      user: { email: "u@example.com" },
    })

    const onAdded = vi.fn()
    const onRemoved = vi.fn()

    const { result } = renderHook(
      () => useToggleResponseBookmark(101, { onAdded, onRemoved }),
      { wrapper: TestProviders }
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isBookmarked).toBe(false)

    await act(async () => {
      result.current.toggle()
    })
    await waitFor(() => expect(onAdded).toHaveBeenCalledTimes(1))
    expect(result.current.isBookmarked).toBe(true)

    await act(async () => {
      result.current.toggle()
    })
    await waitFor(() => expect(onRemoved).toHaveBeenCalledTimes(1))
    expect(result.current.isBookmarked).toBe(false)
  })

  it("toggle is a no-op when responseId is null", async () => {
    useAuthMock.mockReturnValue({
      status: "authenticated",
      user: { email: "u@example.com" },
    })
    const onAdded = vi.fn()
    const { result } = renderHook(
      () => useToggleResponseBookmark(null, { onAdded }),
      { wrapper: TestProviders }
    )
    await act(async () => {
      result.current.toggle()
    })
    expect(onAdded).not.toHaveBeenCalled()
  })
})
