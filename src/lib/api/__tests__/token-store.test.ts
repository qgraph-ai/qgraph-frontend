import { describe, expect, it } from "vitest"

import { tokenStore } from "@/lib/api/token-store"

describe("tokenStore", () => {
  it("stores and retrieves guest tokens by key", () => {
    tokenStore.setGuestToken("search", "guest-token-1")
    expect(tokenStore.getGuestToken("search")).toBe("guest-token-1")

    tokenStore.clearGuestToken("search")
    expect(tokenStore.getGuestToken("search")).toBeNull()
  })

  it("supports a default key", () => {
    tokenStore.setGuestToken("default", "guest-default")
    expect(tokenStore.getGuestToken()).toBe("guest-default")

    tokenStore.clearGuestToken("default")
    expect(tokenStore.getGuestToken()).toBeNull()
  })
})
