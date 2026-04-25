export type Rgb = { r: number; g: number; b: number }
export type Oklch = { l: number; c: number; h: number }

export type SegmentColors = {
  tintLight: string
  tintDark: string
  borderLight: string
  borderDark: string
}

const HEX3 = /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/
const HEX6 = /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/

export function parseHex(input: string | null | undefined): Rgb | null {
  if (!input) return null
  const six = input.match(HEX6)
  if (six) {
    return {
      r: parseInt(six[1], 16),
      g: parseInt(six[2], 16),
      b: parseInt(six[3], 16),
    }
  }
  const three = input.match(HEX3)
  if (three) {
    return {
      r: parseInt(three[1] + three[1], 16),
      g: parseInt(three[2] + three[2], 16),
      b: parseInt(three[3] + three[3], 16),
    }
  }
  return null
}

function linearize(c: number): number {
  const x = c / 255
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
}

/**
 * Convert sRGB (0-255) to OKLCH using Björn Ottosson's matrices.
 * Lightness L is in [0,1], chroma C in [0, ~0.4], hue H in degrees [0,360).
 */
export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const lr = linearize(r)
  const lg = linearize(g)
  const lb = linearize(b)

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb

  const lp = Math.cbrt(l)
  const mp = Math.cbrt(m)
  const sp = Math.cbrt(s)

  const L = 0.2104542553 * lp + 0.793617785 * mp - 0.0040720468 * sp
  const a = 1.9779984951 * lp - 2.428592205 * mp + 0.4505937099 * sp
  const bb = 0.0259040371 * lp + 0.7827717662 * mp - 0.808675766 * sp

  const c = Math.sqrt(a * a + bb * bb)
  let h = (Math.atan2(bb, a) * 180) / Math.PI
  if (h < 0) h += 360
  if (!Number.isFinite(h)) h = 0

  return { l: L, c, h }
}

function fmt(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return "0"
  return Number(n.toFixed(digits)).toString()
}

function oklch(l: number, c: number, h: number): string {
  return `oklch(${fmt(l)} ${fmt(c)} ${fmt(h)})`
}

const TINT_LIGHT_L = 0.96
const TINT_LIGHT_C = 0.04
const TINT_DARK_L = 0.27
const TINT_DARK_C = 0.04
const BORDER_LIGHT_L = 0.62
const BORDER_LIGHT_C = 0.16
const BORDER_DARK_L = 0.72
const BORDER_DARK_C = 0.14

/**
 * Map a backend hex color (any saturation/lightness) to a theme-safe pair of
 * tint+border colors per mode. Hue is taken from the input; lightness and
 * chroma are clamped to a readable band so AI-assigned colors never blow out
 * contrast.
 *
 * Returns null if the input cannot be parsed; callers should then fall back
 * to neutral semantic tokens (bg-card / border-border).
 */
export function hexToSegmentColors(
  hex: string | null | undefined
): SegmentColors | null {
  const rgb = parseHex(hex)
  if (!rgb) return null
  const { h } = rgbToOklch(rgb)
  return {
    tintLight: oklch(TINT_LIGHT_L, TINT_LIGHT_C, h),
    tintDark: oklch(TINT_DARK_L, TINT_DARK_C, h),
    borderLight: oklch(BORDER_LIGHT_L, BORDER_LIGHT_C, h),
    borderDark: oklch(BORDER_DARK_L, BORDER_DARK_C, h),
  }
}
