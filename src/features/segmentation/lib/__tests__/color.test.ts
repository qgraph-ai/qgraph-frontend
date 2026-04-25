import { describe, expect, it } from "vitest"

import { buildColorTokens, normalizeHexColor } from "@/features/segmentation/lib/color"

describe("segmentation color utilities", () => {
  it("normalizes full and short hex values", () => {
    expect(normalizeHexColor("#AaBBcc")).toBe("#aabbcc")
    expect(normalizeHexColor("#0fA")).toBe("#00ffaa")
  })

  it("falls back for invalid colors", () => {
    expect(normalizeHexColor("red")).toBe("#64748b")
    expect(normalizeHexColor("#xyz")).toBe("#64748b")
    expect(normalizeHexColor(undefined)).toBe("#64748b")
  })

  it("builds safe tokens in light and dark themes", () => {
    const light = buildColorTokens("#22c55e", "light")
    const dark = buildColorTokens("#22c55e", "dark")

    expect(light.base).toBe("#22c55e")
    expect(dark.base).toBe("#22c55e")

    expect(light.background).toMatch(/^#[0-9a-f]{6}$/)
    expect(light.foreground).toMatch(/^#[0-9a-f]{6}$/)
    expect(light.border).toMatch(/^#[0-9a-f]{6}$/)

    expect(dark.background).toMatch(/^#[0-9a-f]{6}$/)
    expect(dark.foreground).toMatch(/^#[0-9a-f]{6}$/)
    expect(dark.border).toMatch(/^#[0-9a-f]{6}$/)

    expect(light.background).not.toBe(dark.background)
  })

  it("handles contrast extremes without throwing", () => {
    const nearWhiteLight = buildColorTokens("#ffffff", "light")
    const nearBlackDark = buildColorTokens("#000000", "dark")

    expect(nearWhiteLight.foreground).toMatch(/^#[0-9a-f]{6}$/)
    expect(nearBlackDark.foreground).toMatch(/^#[0-9a-f]{6}$/)
  })
})
