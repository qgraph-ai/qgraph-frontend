import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

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
import { API_URL } from "@/lib/env"
import { tokenStore } from "@/lib/api"
import { SEARCH_GUEST_TOKEN_KEY } from "@/services/search"

import { server } from "../../../../../tests/msw/server"
import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../../../../tests/test-utils"

const POLL_PATH_PREFIX = "/api/v1/search/executions"

afterEach(() => {
  tokenStore.clearGuestToken(SEARCH_GUEST_TOKEN_KEY)
})

describe("SearchExperience (live)", () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ status: "unauthenticated", user: null })
    routerPush.mockReset()
  })

  it("renders the Django-provided text block after submitting a query", async () => {
    renderWithProviders(<SearchExperience initialQuery="" />)

    const input = screen.getByPlaceholderText(
      /ask a question or enter a concept/i
    )
    await userEvent.type(input, "mercy{Enter}")

    expect(routerPush).toHaveBeenCalledWith(
      expect.stringContaining("/search?q=mercy"),
      expect.objectContaining({ scroll: false })
    )

    await waitFor(
      () =>
        expect(
          screen.getByText("Mercy across the Qur'an")
        ).toBeInTheDocument(),
      { timeout: 4000 }
    )
    expect(screen.getByText("Paragraph one from Django.")).toBeInTheDocument()
    expect(screen.getByText("Paragraph two from Django.")).toBeInTheDocument()
  }, 10_000)

  it("shows the error UI without rendering blocks when the execution fails", async () => {
    server.use(
      http.get(`${API_URL}${POLL_PATH_PREFIX}/:id/`, () =>
        HttpResponse.json({
          id: 5435,
          query_id: 1,
          execution_number: 1,
          status: "failed",
          mode: "async",
          started_at: null,
          completed_at: null,
          latency_ms: null,
          response_available: false,
          created_at: "2026-05-03T00:00:00Z",
          updated_at: "2026-05-03T00:00:00Z",
        })
      )
    )

    renderWithProviders(<SearchExperience initialQuery="" />)

    const input = screen.getByPlaceholderText(
      /ask a question or enter a concept/i
    )
    await userEvent.type(input, "broken{Enter}")

    await waitFor(
      () =>
        expect(
          screen.getByText(/search failed before producing results/i)
        ).toBeInTheDocument(),
      { timeout: 4000 }
    )
    expect(screen.queryByText("Mercy across the Qur'an")).toBeNull()
    expect(screen.queryByText(/Paragraph one from Django\./)).toBeNull()
  }, 10_000)
})
