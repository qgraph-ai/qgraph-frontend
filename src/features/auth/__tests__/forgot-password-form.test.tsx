import { describe, expect, it } from "vitest"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"

import { ForgotPasswordForm } from "@/app/auth/forgot-password/forgot-password-form"
import { API_URL } from "@/lib/env"

import { server } from "../../../../tests/msw/server"
import { renderWithProviders, screen, waitFor } from "../../../../tests/test-utils"

describe("ForgotPasswordForm", () => {
  it("requires an email", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ForgotPasswordForm />)
    await user.click(screen.getByRole("button", { name: /send reset link/i }))
    expect(await screen.findByText(/enter your email/i)).toBeInTheDocument()
  })

  it("shows acknowledged screen on success", async () => {
    const user = userEvent.setup()
    renderWithProviders(<ForgotPasswordForm />)
    await user.type(screen.getByLabelText(/email/i), "known@example.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it("does not leak existence: also acknowledges on failed requests", async () => {
    server.use(
      http.post(`${API_URL}/api/auth/users/reset_password/`, () =>
        HttpResponse.json({ email: ["not found"] }, { status: 400 })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<ForgotPasswordForm />)
    await user.type(screen.getByLabelText(/email/i), "nobody@example.com")
    await user.click(screen.getByRole("button", { name: /send reset link/i }))

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/not found/i)).not.toBeInTheDocument()
  })
})
