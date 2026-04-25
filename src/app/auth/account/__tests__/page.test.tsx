import { describe, expect, it, vi } from "vitest"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

const { getServerSessionMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
}))

vi.mock("@/lib/auth/session.server", () => ({
  getServerSession: getServerSessionMock,
}))

vi.mock("@/app/auth/account/account-page-client", () => ({
  AccountPageClient: ({
    initialUser,
  }: {
    initialUser: { email: string } | null
  }) => <div data-testid="account-page">{initialUser?.email ?? "none"}</div>,
}))

import AccountPage, { generateMetadata } from "@/app/auth/account/page"

describe("Account page server session handoff", () => {
  it("generates account metadata", async () => {
    const metadata = await generateMetadata()
    expect(metadata.title).toBe("Account")
  })

  it("passes server session user to the client view", async () => {
    getServerSessionMock.mockResolvedValueOnce({
      id: 42,
      email: "guarded@example.com",
      first_name: "Guarded",
      last_name: "User",
    })

    const element = await AccountPage()
    renderWithProviders(element)

    expect(getServerSessionMock).toHaveBeenCalled()
    expect(screen.getByTestId("account-page")).toHaveTextContent(
      "guarded@example.com"
    )
  })

  it("passes null when server session is not available", async () => {
    getServerSessionMock.mockResolvedValueOnce(null)

    const element = await AccountPage()
    renderWithProviders(element)

    expect(getServerSessionMock).toHaveBeenCalled()
    expect(screen.getByTestId("account-page")).toHaveTextContent("none")
  })
})
