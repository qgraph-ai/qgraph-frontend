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
    renderWithProviders(<SignInForm resetSuccess={false} nextPath="/" />)

    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(await screen.findByText(/enter your email/i)).toBeInTheDocument()
    expect(await screen.findByText(/enter your password/i)).toBeInTheDocument()
  })

  it("navigates to '/' on successful sign-in", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <SignInForm resetSuccess={false} nextPath="https://evil.example/hijack" />
    )

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "correct-password")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/")
    })
  })

  it("surfaces an invalid-credentials error on 401", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInForm resetSuccess={false} nextPath="/" />)

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "wrong")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(
      await screen.findByText(/email or password is incorrect/i)
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /resend activation email/i })
    ).not.toBeInTheDocument()
    expect(mockRouter.replace).not.toHaveBeenCalled()
  })

  it("shows the resend activation CTA on inactive-user 401", async () => {
    server.use(
      http.post(`${API_URL}/api/auth/jwt/create/`, () =>
        HttpResponse.json(
          {
            code: "inactive_user",
            detail: "This user account is disabled.",
          },
          { status: 401 }
        )
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<SignInForm resetSuccess={false} nextPath="/" />)

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "correct-password")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(
      await screen.findByText(/hasn't been activated yet/i)
    ).toBeInTheDocument()
    expect(
      await screen.findByRole("button", { name: /resend activation email/i })
    ).toBeInTheDocument()
  })

  it("redirects to a safe internal nextPath when provided", async () => {
    const user = userEvent.setup()
    renderWithProviders(<SignInForm resetSuccess={false} nextPath="/quran/1" />)

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "correct-password")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/quran/1")
    })
  })

  it("falls back guest-back link to '/' when nextPath is an auth route", async () => {
    renderWithProviders(
      <SignInForm resetSuccess={false} nextPath="/auth/account" />
    )

    const guestLink = screen.getByRole("link", { name: /continue as guest/i })
    expect(guestLink).toHaveAttribute("href", "/")
  })

  it("uses same-origin referrer when nextPath is root", async () => {
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "http://localhost:3000/search?q=rahma",
    })

    const user = userEvent.setup()
    renderWithProviders(<SignInForm resetSuccess={false} nextPath="/" />)

    const guestLink = screen.getByRole("link", { name: /continue as guest/i })
    expect(guestLink).toHaveAttribute("href", "/search?q=rahma")

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "correct-password")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith("/search?q=rahma")
    })
  })

  it("shows a generic error for non-401 failures", async () => {
    server.use(
      http.post(`${API_URL}/api/auth/jwt/create/`, () =>
        HttpResponse.json({ detail: "server down" }, { status: 500 })
      )
    )

    const user = userEvent.setup()
    renderWithProviders(<SignInForm resetSuccess={false} nextPath="/" />)

    await user.type(screen.getByLabelText(/email/i), "user@example.com")
    await user.type(screen.getByLabelText(/^password$/i), "correct-password")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    expect(await screen.findByText(/server down/i)).toBeInTheDocument()
  })
})
