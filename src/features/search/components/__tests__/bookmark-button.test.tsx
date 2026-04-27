import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

const useAuthMock = vi.hoisted(() => vi.fn())

vi.mock("@/features/auth/use-auth", () => ({
  useAuth: useAuthMock,
}))

const toastSuccess = vi.hoisted(() => vi.fn())
const toastError = vi.hoisted(() => vi.fn())
vi.mock("react-hot-toast", () => ({
  default: { success: toastSuccess, error: toastError },
}))

import { BookmarkButton } from "@/features/search/components/bookmark-button"

import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../../../../tests/test-utils"

describe("BookmarkButton", () => {
  beforeEach(() => {
    useAuthMock.mockReset()
    toastSuccess.mockReset()
    toastError.mockReset()
  })

  it("shows a sign-in link for guests", () => {
    useAuthMock.mockReturnValue({ status: "unauthenticated", user: null })
    renderWithProviders(<BookmarkButton responseId={1} />)
    const link = screen.getByRole("link", { name: /bookmark/i })
    expect(link.getAttribute("href")).toMatch(/\/auth\/sign-in\?next=/)
  })

  it("toggles add and remove for authenticated users with toast feedback", async () => {
    useAuthMock.mockReturnValue({
      status: "authenticated",
      user: { email: "u@example.com" },
    })

    renderWithProviders(<BookmarkButton responseId={777} />)

    const btn = await screen.findByRole("button", { name: /bookmark/i })
    expect(btn).toHaveAttribute("aria-pressed", "false")

    await userEvent.click(btn)
    await waitFor(() => expect(toastSuccess).toHaveBeenCalled())
    expect(btn).toHaveAttribute("aria-pressed", "true")

    await userEvent.click(btn)
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledTimes(2))
    expect(btn).toHaveAttribute("aria-pressed", "false")
  })
})
