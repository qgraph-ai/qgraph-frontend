import { describe, expect, it, vi } from "vitest"
import { renderWithProviders } from "../../../../../tests/test-utils"

const { callbackCardMock } = vi.hoisted(() => ({
  callbackCardMock: vi.fn(() => null),
}))

vi.mock("@/app/auth/callback/callback-card", () => ({
  CallbackCard: callbackCardMock,
}))

import CallbackPage from "@/app/auth/callback/page"

describe("CallbackPage", () => {
  it("sanitizes `next` before rendering callback card", async () => {
    const element = await CallbackPage({
      searchParams: Promise.resolve({
        next: "//evil.example/path",
        error: undefined,
      }),
    })
    renderWithProviders(element)

    expect(callbackCardMock).toHaveBeenCalledWith(
      {
        errorCode: null,
        nextPath: "/",
      },
      undefined
    )
  })
})
