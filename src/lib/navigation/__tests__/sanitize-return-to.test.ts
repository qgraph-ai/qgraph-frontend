import { describe, expect, it } from "vitest"

import { sanitizeReturnTo } from "@/lib/navigation/sanitize-return-to"

describe("sanitizeReturnTo", () => {
  it("keeps safe internal paths", () => {
    expect(sanitizeReturnTo("/quran/2")).toBe("/quran/2")
    expect(sanitizeReturnTo("/auth/sign-in?next=%2Fquran")).toBe(
      "/auth/sign-in?next=%2Fquran"
    )
  })

  it("falls back for missing/unsafe paths", () => {
    expect(sanitizeReturnTo(undefined)).toBe("/")
    expect(sanitizeReturnTo("")).toBe("/")
    expect(sanitizeReturnTo("https://evil.example")).toBe("/")
    expect(sanitizeReturnTo("//evil.example")).toBe("/")
    expect(sanitizeReturnTo("javascript:alert(1)")).toBe("/")
    expect(sanitizeReturnTo("/safe\ninjected")).toBe("/")
  })

  it("supports a custom fallback path", () => {
    expect(sanitizeReturnTo("https://evil.example", "/quran")).toBe("/quran")
  })
})
