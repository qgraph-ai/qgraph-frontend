import { describe, expect, it, vi } from "vitest"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

const { requireAuthMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
}))

vi.mock("@/lib/auth/require-auth.server", () => ({
  requireAuth: requireAuthMock,
}))

vi.mock("@/app/auth/account/account-page-client", () => ({
  AccountPageClient: ({ initialUser }: { initialUser: { email: string } }) => (
    <div data-testid="account-page">{initialUser.email}</div>
  ),
}))

import AccountPage, { generateMetadata } from "@/app/auth/account/page"

describe("Account page server guard", () => {
  it("generates account metadata", async () => {
    const metadata = await generateMetadata()
    expect(metadata.title).toBe("Account")
  })

  it("requires auth at the server boundary and passes the user to client view", async () => {
    requireAuthMock.mockResolvedValueOnce({
      id: 42,
      email: "guarded@example.com",
      first_name: "Guarded",
      last_name: "User",
    })

    const element = await AccountPage()
    renderWithProviders(element)

    expect(requireAuthMock).toHaveBeenCalledWith("/auth/account")
    expect(screen.getByTestId("account-page")).toHaveTextContent(
      "guarded@example.com"
    )
  })
})
