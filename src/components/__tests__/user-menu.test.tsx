import { describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"

import { mockRouter } from "../../../tests/setup"
import { renderWithProviders, screen, waitFor } from "../../../tests/test-utils"

const { useAuthMock, useLogoutMock, logoutMutateMock } = vi.hoisted(() => {
  const logoutMutate = vi.fn()
  return {
    useAuthMock: vi.fn(),
    useLogoutMock: vi.fn(() => ({
      mutate: logoutMutate,
      isPending: false,
    })),
    logoutMutateMock: logoutMutate,
  }
})

vi.mock("@/features/auth/use-auth", () => ({
  useAuth: useAuthMock,
}))

vi.mock("@/features/auth/use-logout", () => ({
  useLogout: useLogoutMock,
}))

import { UserMenu, buildSignInHref } from "@/components/user-menu"

describe("buildSignInHref", () => {
  it("keeps current route as next when not on root", () => {
    expect(buildSignInHref("/search", "q=rahma")).toBe(
      "/auth/sign-in?next=%2Fsearch%3Fq%3Drahma"
    )
  })

  it("uses plain sign-in route when current route is root", () => {
    expect(buildSignInHref("/", "")).toBe("/auth/sign-in")
  })
})

describe("UserMenu", () => {
  it("shows sign-in and sign-up for unauthenticated users", () => {
    useAuthMock.mockReturnValue({
      status: "unauthenticated",
      user: null,
    })

    renderWithProviders(<UserMenu />)

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/auth/sign-in"
    )
    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/auth/sign-up"
    )
  })

  it("shows account trigger for authenticated users", () => {
    useAuthMock.mockReturnValue({
      status: "authenticated",
      user: {
        id: 1,
        email: "user@example.com",
        first_name: "QGraph",
        last_name: "User",
      },
    })

    renderWithProviders(<UserMenu />)

    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Account" })).toBeInTheDocument()
  })

  it("signs out and navigates home when sign-out is selected", async () => {
    const user = userEvent.setup()
    useAuthMock.mockReturnValue({
      status: "authenticated",
      user: {
        id: 1,
        email: "user@example.com",
        first_name: "QGraph",
        last_name: "User",
      },
    })

    logoutMutateMock.mockImplementation((_vars, opts) => {
      opts?.onSuccess?.()
    })

    renderWithProviders(<UserMenu />)

    await user.click(screen.getByRole("button", { name: "Account" }))
    await user.click(screen.getByRole("menuitem", { name: "Sign out" }))

    await waitFor(() => {
      expect(logoutMutateMock).toHaveBeenCalled()
      expect(mockRouter.replace).toHaveBeenCalledWith("/")
      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })
})

