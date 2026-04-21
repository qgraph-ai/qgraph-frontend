import { describe, expect, it } from "vitest"
import userEvent from "@testing-library/user-event"

import { SignUpForm } from "@/app/auth/sign-up/sign-up-form"

import { mockRouter } from "../../../../tests/setup"
import { renderWithProviders, screen, waitFor } from "../../../../tests/test-utils"

describe("SignUpForm", () => {
  it("blocks submit when passwords don't match", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "longenough1")
    await user.type(screen.getByLabelText(/confirm password/i), "different1")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    expect(await screen.findByText(/passwords don't match/i)).toBeInTheDocument()
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it("rejects invalid email format", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), "not-an-email")
    await user.type(screen.getByLabelText(/^password$/i), "longenough1")
    await user.type(screen.getByLabelText(/confirm password/i), "longenough1")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    expect(
      await screen.findByText(/enter a valid email address/i)
    ).toBeInTheDocument()
  })

  it("routes to check-your-email on success", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "longenough1")
    await user.type(screen.getByLabelText(/confirm password/i), "longenough1")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        expect.stringContaining("/auth/check-your-email?email=new%40example.com")
      )
    })
  })

  it("maps server-side email error onto the field", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignUpForm />)

    await user.type(screen.getByLabelText(/email/i), "taken@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "longenough1")
    await user.type(screen.getByLabelText(/confirm password/i), "longenough1")
    await user.click(screen.getByRole("button", { name: /create account/i }))

    expect(
      await screen.findByText(/user with this email already exists/i)
    ).toBeInTheDocument()
  })
})
