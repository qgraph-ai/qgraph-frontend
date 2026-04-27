import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const useAuthMock = vi.hoisted(() => vi.fn())
vi.mock("@/features/auth/use-auth", () => ({
  useAuth: useAuthMock,
}))

const routerPush = vi.hoisted(() => vi.fn())
vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<object>("next/navigation")
  return {
    ...actual,
    useRouter: () => ({
      push: routerPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => "/search",
    useSearchParams: () => new URLSearchParams(),
  }
})

import { SearchExperience } from "@/features/search/components/search-experience"

import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../../../../tests/test-utils"

describe("SearchExperience", () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ status: "unauthenticated", user: null })
    routerPush.mockReset()
  })

  it("renders the centered hero when no query is set", () => {
    renderWithProviders(<SearchExperience initialQuery="" />)
    expect(
      screen.getByRole("heading", { name: /ask anything about the qur'an/i })
    ).toBeInTheDocument()
  })

  it("submits the typed query, pushes the URL, and switches to the top layout", async () => {
    renderWithProviders(<SearchExperience initialQuery="" />)

    const input = screen.getByPlaceholderText(/ask a question or enter a concept/i)
    await userEvent.type(input, "mercy{Enter}")

    expect(routerPush).toHaveBeenCalledWith(
      expect.stringContaining("/search?q=mercy"),
      expect.objectContaining({ scroll: false })
    )

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", {
          name: /ask anything about the qur'an/i,
        })
      ).toBeNull()
    )
  })
})
