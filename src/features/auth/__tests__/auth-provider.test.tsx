import { describe, expect, it, vi } from "vitest"
import { useEffect } from "react"

import { renderWithProviders, screen } from "../../../../tests/test-utils"

const { useCurrentUserMock } = vi.hoisted(() => ({
  useCurrentUserMock: vi.fn(),
}))

vi.mock("@/features/auth/use-current-user", () => ({
  useCurrentUser: useCurrentUserMock,
}))

import { AuthProvider, useAuthContext } from "@/features/auth/auth-provider"

function Probe() {
  const { status, user, error } = useAuthContext()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="email">{user?.email ?? "none"}</span>
      <span data-testid="error-status">{String(error?.status ?? "none")}</span>
    </div>
  )
}

function RefetchProbe({ onRefetch }: { onRefetch: () => void }) {
  const { refetch } = useAuthContext()
  useEffect(() => {
    refetch()
    onRefetch()
  }, [onRefetch, refetch])
  return null
}

describe("AuthProvider", () => {
  it("provides loading status while user query is pending", () => {
    useCurrentUserMock.mockReturnValue({
      isPending: true,
      data: undefined,
      error: null,
      refetch: vi.fn(),
    })

    renderWithProviders(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    expect(screen.getByTestId("status")).toHaveTextContent("loading")
    expect(screen.getByTestId("email")).toHaveTextContent("none")
  })

  it("provides authenticated status when a user exists", () => {
    useCurrentUserMock.mockReturnValue({
      isPending: false,
      data: {
        id: 1,
        email: "user@example.com",
        first_name: "QGraph",
        last_name: "User",
      },
      error: null,
      refetch: vi.fn(),
    })

    renderWithProviders(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    expect(screen.getByTestId("status")).toHaveTextContent("authenticated")
    expect(screen.getByTestId("email")).toHaveTextContent("user@example.com")
  })

  it("provides unauthenticated status and normalized error when no user exists", () => {
    useCurrentUserMock.mockReturnValue({
      isPending: false,
      data: undefined,
      error: {
        status: 401,
        message: "Unauthorized",
        code: "ERR_BAD_REQUEST",
        details: null,
      },
      refetch: vi.fn(),
    })

    renderWithProviders(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )

    expect(screen.getByTestId("status")).toHaveTextContent("unauthenticated")
    expect(screen.getByTestId("error-status")).toHaveTextContent("401")
  })

  it("exposes refetch function through context", () => {
    const refetchMock = vi.fn()
    const onRefetch = vi.fn()
    useCurrentUserMock.mockReturnValue({
      isPending: false,
      data: undefined,
      error: null,
      refetch: refetchMock,
    })

    renderWithProviders(
      <AuthProvider>
        <RefetchProbe onRefetch={onRefetch} />
      </AuthProvider>
    )

    expect(refetchMock).toHaveBeenCalled()
    expect(onRefetch).toHaveBeenCalled()
  })

  it("throws when useAuthContext is used without provider", () => {
    function InvalidConsumer() {
      useAuthContext()
      return null
    }

    expect(() => renderWithProviders(<InvalidConsumer />)).toThrow(
      /useAuthContext must be used within <AuthProvider>/i
    )
  })
})

