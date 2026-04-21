import { describe, expect, it } from "vitest"
import userEvent from "@testing-library/user-event"

import { ResetPasswordConfirmForm } from "@/app/auth/password/reset/confirm/[uid]/[token]/reset-password-confirm-form"

import { mockRouter } from "../../../../tests/setup"
import { renderWithProviders, screen, waitFor } from "../../../../tests/test-utils"

describe("ResetPasswordConfirmForm", () => {
  it("requires passwords to match", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordConfirmForm uid="MQ" token="good" />)

    await user.type(screen.getByLabelText(/new password/i), "longenough1")
    await user.type(screen.getByLabelText(/confirm password/i), "different1")
    await user.click(screen.getByRole("button", { name: /update password/i }))

    expect(
      await screen.findByText(/passwords don't match/i)
    ).toBeInTheDocument()
    expect(mockRouter.replace).not.toHaveBeenCalled()
  })

  it("redirects to sign-in on success", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordConfirmForm uid="MQ" token="good" />)

    await user.type(screen.getByLabelText(/new password/i), "longenough1")
    await user.type(screen.getByLabelText(/confirm password/i), "longenough1")
    await user.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/auth/sign-in?reset=1")
    })
  })

  it("shows a form error when the token is invalid", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ResetPasswordConfirmForm uid="MQ" token="bad" />)

    await user.type(screen.getByLabelText(/new password/i), "longenough1")
    await user.type(screen.getByLabelText(/confirm password/i), "longenough1")
    await user.click(screen.getByRole("button", { name: /update password/i }))

    await waitFor(() => {
      expect(mockRouter.replace).not.toHaveBeenCalled()
    })
    expect(
      screen.getByText(/invalid token|reset link may have expired/i)
    ).toBeInTheDocument()
  })
})
