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

import { FeedbackButtons } from "@/features/search/components/feedback-buttons"

import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../../../../tests/test-utils"

describe("FeedbackButtons", () => {
  beforeEach(() => {
    useAuthMock.mockReset()
    toastSuccess.mockReset()
    toastError.mockReset()
  })

  it("renders sign-in links for guests", () => {
    useAuthMock.mockReturnValue({ status: "unauthenticated", user: null })
    renderWithProviders(<FeedbackButtons responseId={9} />)
    const links = screen.getAllByRole("link")
    expect(links.length).toBeGreaterThanOrEqual(2)
    for (const link of links) {
      expect(link.getAttribute("href")).toMatch(/\/auth\/sign-in\?next=/)
    }
  })

  it("submits feedback and disables both buttons after success", async () => {
    useAuthMock.mockReturnValue({
      status: "authenticated",
      user: { email: "u@example.com" },
    })
    renderWithProviders(<FeedbackButtons responseId={9} />)

    const helpful = screen.getByRole("button", { name: /^helpful$/i })
    await userEvent.click(helpful)

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled())
    const buttons = screen.getAllByRole("button")
    for (const button of buttons) {
      expect(button).toBeDisabled()
    }
    expect(screen.getByText(/thanks for the feedback/i)).toBeInTheDocument()
  })
})
