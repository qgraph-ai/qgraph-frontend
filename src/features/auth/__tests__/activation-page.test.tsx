import { describe, expect, it } from "vitest"

import { ActivateCard } from "@/app/auth/activate/[uid]/[token]/activate-card"

import { renderWithProviders, screen, waitFor } from "../../../../tests/test-utils"

describe("ActivateCard", () => {
  it("shows success state when activation succeeds", async () => {
    renderWithProviders(<ActivateCard uid="MQ" token="good-token" />)

    await waitFor(() => {
      expect(screen.getByText(/account activated/i)).toBeInTheDocument()
    })
    expect(screen.getByRole("link", { name: /go to sign in/i })).toHaveAttribute(
      "href",
      "/auth/sign-in"
    )
  })

  it("shows error state when token is invalid", async () => {
    renderWithProviders(<ActivateCard uid="MQ" token="bad" />)

    await waitFor(() => {
      expect(screen.getByText(/activation failed/i)).toBeInTheDocument()
    })
  })
})
