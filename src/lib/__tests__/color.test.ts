import { describe, expect, it } from "vitest"

import { hexToSegmentColors, parseHex, rgbToOklch } from "../color"

describe("parseHex", () => {
  it("parses #rrggbb", () => {
    expect(parseHex("#22c55e")).toEqual({ r: 0x22, g: 0xc5, b: 0x5e })
  })

  it("parses rrggbb without #", () => {
    expect(parseHex("a855f7")).toEqual({ r: 0xa8, g: 0x55, b: 0xf7 })
  })

  it("parses #rgb shorthand by doubling each digit", () => {
    expect(parseHex("#abc")).toEqual({ r: 0xaa, g: 0xbb, b: 0xcc })
  })

  it("returns null for invalid input", () => {
    expect(parseHex("")).toBeNull()
    expect(parseHex("not-a-color")).toBeNull()
    expect(parseHex("#12")).toBeNull()
    expect(parseHex(null)).toBeNull()
    expect(parseHex(undefined)).toBeNull()
  })
})

describe("rgbToOklch", () => {
  it("returns L close to 1 for pure white", () => {
    const { l, c } = rgbToOklch({ r: 255, g: 255, b: 255 })
    expect(l).toBeGreaterThan(0.99)
    expect(c).toBeLessThan(0.01)
  })

  it("returns L close to 0 for pure black", () => {
    const { l, c } = rgbToOklch({ r: 0, g: 0, b: 0 })
    expect(l).toBeLessThan(0.01)
    expect(c).toBeLessThan(0.01)
  })

  it("preserves hue across saturated reds", () => {
    const { h: redH } = rgbToOklch({ r: 255, g: 0, b: 0 })
    const { h: redH2 } = rgbToOklch({ r: 200, g: 0, b: 0 })
    expect(Math.abs(redH - redH2)).toBeLessThan(1)
    expect(redH).toBeGreaterThan(20)
    expect(redH).toBeLessThan(40)
  })

  it("returns hue normalized to [0, 360)", () => {
    const { h } = rgbToOklch({ r: 0, g: 128, b: 255 })
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThan(360)
  })
})

describe("hexToSegmentColors", () => {
  it("returns null for invalid hex", () => {
    expect(hexToSegmentColors("not-hex")).toBeNull()
    expect(hexToSegmentColors(null)).toBeNull()
  })

  it("emits four oklch() strings sharing the same hue", () => {
    const palette = hexToSegmentColors("#22c55e")
    expect(palette).not.toBeNull()
    if (!palette) return

    const hueRegex = /oklch\([^ ]+ [^ ]+ ([^)]+)\)/
    const hues = [
      palette.tintLight,
      palette.tintDark,
      palette.borderLight,
      palette.borderDark,
    ].map((s) => Number(s.match(hueRegex)?.[1] ?? "NaN"))

    expect(hues.every((h) => Number.isFinite(h))).toBe(true)
    const first = hues[0]
    expect(hues.every((h) => Math.abs(h - first) < 0.5)).toBe(true)
  })

  it("uses the documented light/dark lightness clamps", () => {
    const palette = hexToSegmentColors("#a855f7")
    if (!palette) throw new Error("expected palette")

    const lightnessOf = (s: string) =>
      Number(s.match(/oklch\(([^ ]+) /)?.[1] ?? "NaN")

    expect(lightnessOf(palette.tintLight)).toBeCloseTo(0.96, 2)
    expect(lightnessOf(palette.tintDark)).toBeCloseTo(0.27, 2)
    expect(lightnessOf(palette.borderLight)).toBeCloseTo(0.62, 2)
    expect(lightnessOf(palette.borderDark)).toBeCloseTo(0.72, 2)
  })

  it("differentiates hue across distinct input colors", () => {
    const a = hexToSegmentColors("#22c55e")
    const b = hexToSegmentColors("#a855f7")
    if (!a || !b) throw new Error("expected palettes")
    const hueOf = (s: string) =>
      Number(s.match(/oklch\([^ ]+ [^ ]+ ([^)]+)\)/)?.[1] ?? "NaN")
    expect(Math.abs(hueOf(a.tintLight) - hueOf(b.tintLight))).toBeGreaterThan(50)
  })
})
