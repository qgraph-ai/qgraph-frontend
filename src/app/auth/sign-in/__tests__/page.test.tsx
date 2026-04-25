import { describe, expect, it, vi } from "vitest"
import { renderWithProviders } from "../../../../../tests/test-utils"

const { signInFormMock } = vi.hoisted(() => ({
  signInFormMock: vi.fn(() => null),
}))

vi.mock("@/app/auth/sign-in/sign-in-form", () => ({
  SignInForm: signInFormMock,
}))

import SignInPage, { generateMetadata } from "@/app/auth/sign-in/page"

describe("SignInPage", () => {
  it("generates sign-in metadata", async () => {
    const metadata = await generateMetadata()
    expect(metadata.title).toBe("Welcome back")
  })

  it("sanitizes `next` and passes only safe internal paths to SignInForm", async () => {
    const element = await SignInPage({
      searchParams: Promise.resolve({
        next: "https://evil.example/redirect",
        reset: "1",
      }),
    })
    renderWithProviders(element)

    expect(signInFormMock).toHaveBeenCalledWith(
      {
        resetSuccess: true,
        nextPath: "/",
      },
      undefined
    )
  })

  it("passes safe internal `next` path to SignInForm", async () => {
    const element = await SignInPage({
      searchParams: Promise.resolve({
        next: "/search",
      }),
    })
    renderWithProviders(element)

    expect(signInFormMock).toHaveBeenCalledWith(
      {
        resetSuccess: false,
        nextPath: "/search",
      },
      undefined
    )
  })
})
