import { describe, expect, it } from "vitest"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"

import { SignInForm } from "@/app/auth/sign-in/sign-in-form"
import { API_URL } from "@/lib/env"

import { mockRouter } from "../../../../tests/setup"
import { server } from "../../../../tests/msw/server"
import { renderWithProviders, screen, waitFor } from "../../../../tests/test-utils"

describe("SignInForm", () => {
  it("shows validation errors when fields are empty", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInForm resetSuccess={false} nextPath={null} />)

    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(await screen.findByText(/enter your email/i)).toBeInTheDocument()
    expect(await screen.findByText(/enter your password/i)).toBeInTheDocument()
  })

  it("navigates to '/' on successful sign-in", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInForm resetSuccess={false} nextPath={null} />)

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "correct-password")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/")
    })
  })

  it("surfaces an invalid-credentials error on 401", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInForm resetSuccess={false} nextPath={null} />)

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "wrong")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(
      await screen.findByText(/email or password is incorrect/i)
    ).toBeInTheDocument()
    expect(mockRouter.replace).not.toHaveBeenCalled()
  })

  it("shows the resend activation CTA on inactive-user 401", async () => {
    server.use(
      http.post(`${API_URL}/api/auth/jwt/create/`, () =>
        HttpResponse.json(
          { detail: "No active account found with the given credentials" },
          { status: 401 }
        )
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<SignInForm resetSuccess={false} nextPath={null} />)

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "correct-password")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(
      await screen.findByRole("button", { name: /resend activation email/i })
    ).toBeInTheDocument()
  })
})
