import { describe, expect, it, vi } from "vitest"

import { mockRouter } from "../../../../../tests/setup"
import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../../../../tests/test-utils"

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}))

vi.mock("@/features/auth/use-auth", () => ({
  useAuth: useAuthMock,
}))

import { CallbackCard } from "@/app/auth/callback/callback-card"
import { setPostAuthReturnTo } from "@/lib/navigation/post-auth-return"

describe("CallbackCard", () => {
  it("renders a retry state when callback has an error", () => {
    useAuthMock.mockReturnValue({
      status: "unauthenticated",
      refetch: vi.fn(),
    })

    renderWithProviders(<CallbackCard errorCode="oauth_callback_failed" nextPath="/" />)

    expect(screen.getByText(/sign in failed/i)).toBeInTheDocument()
    expect(mockRouter.replace).not.toHaveBeenCalled()
  })

  it("redirects only to safe internal paths after successful callback", async () => {
    useAuthMock.mockReturnValue({
      status: "authenticated",
      refetch: vi.fn(),
    })

    renderWithProviders(
      <CallbackCard
        errorCode={null}
        nextPath="https://evil.example/path?x=1"
      />
    )

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/")
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  it("falls back to stored post-auth return path when callback next is root", async () => {
    setPostAuthReturnTo("/search?q=rahma")
    useAuthMock.mockReturnValue({
      status: "authenticated",
      refetch: vi.fn(),
    })

    renderWithProviders(<CallbackCard errorCode={null} nextPath="/" />)

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/search?q=rahma")
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })
})
