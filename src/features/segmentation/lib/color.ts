export type ThemeMode = "light" | "dark"

const FALLBACK_HEX = "#64748b"
const WHITE_RGB: RGB = { r: 255, g: 255, b: 255 }
const BLACK_RGB: RGB = { r: 0, g: 0, b: 0 }
const MIN_CONTRAST = 4.5

type RGB = {
  r: number
  g: number
  b: number
}

export type ColorTokens = {
  base: string
  background: string
  foreground: string
  border: string
}

export function normalizeHexColor(
  input: string | null | undefined,
  fallback = FALLBACK_HEX
): string {
  const candidate = (input ?? "").trim()

  if (!candidate.startsWith("#")) return fallback

  const body = candidate.slice(1)

  if (/^[0-9a-fA-F]{3}$/.test(body)) {
    const expanded = body
      .split("")
      .map((c) => `${c}${c}`)
      .join("")
    return `#${expanded.toLowerCase()}`
  }

  if (/^[0-9a-fA-F]{6}$/.test(body)) {
    return `#${body.toLowerCase()}`
  }

  return fallback
}

export function buildColorTokens(
  rawColor: string,
  theme: ThemeMode
): ColorTokens {
  const base = normalizeHexColor(rawColor)
  const baseRgb = hexToRgb(base)

  const rawBackground =
    theme === "dark"
      ? mixRgb(baseRgb, BLACK_RGB, 0.68)
      : mixRgb(baseRgb, WHITE_RGB, 0.84)

  const adjustedBackground = ensureContrast(rawBackground)
  const foreground = pickForeground(adjustedBackground)
  const border =
    theme === "dark"
      ? mixRgb(baseRgb, WHITE_RGB, 0.34)
      : mixRgb(baseRgb, BLACK_RGB, 0.2)

  return {
    base,
    background: rgbToHex(adjustedBackground),
    foreground: rgbToHex(foreground),
    border: rgbToHex(border),
  }
}

function hexToRgb(hex: string): RGB {
  const body = hex.replace("#", "")
  return {
    r: Number.parseInt(body.slice(0, 2), 16),
    g: Number.parseInt(body.slice(2, 4), 16),
    b: Number.parseInt(body.slice(4, 6), 16),
  }
}

function rgbToHex(rgb: RGB): string {
  return (
    "#" +
    [rgb.r, rgb.g, rgb.b]
      .map((value) => clamp(value).toString(16).padStart(2, "0"))
      .join("")
  )
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function mixRgb(primary: RGB, secondary: RGB, secondaryWeight: number): RGB {
  const clampedWeight = Math.max(0, Math.min(1, secondaryWeight))

  return {
    r: primary.r * (1 - clampedWeight) + secondary.r * clampedWeight,
    g: primary.g * (1 - clampedWeight) + secondary.g * clampedWeight,
    b: primary.b * (1 - clampedWeight) + secondary.b * clampedWeight,
  }
}

function pickForeground(background: RGB): RGB {
  const whiteContrast = contrastRatio(background, WHITE_RGB)
  const blackContrast = contrastRatio(background, BLACK_RGB)
  return whiteContrast > blackContrast ? WHITE_RGB : BLACK_RGB
}

function ensureContrast(initialBackground: RGB): RGB {
  let background = initialBackground
  let foreground = pickForeground(background)

  for (let step = 0; step < 12; step += 1) {
    if (contrastRatio(background, foreground) >= MIN_CONTRAST) {
      return background
    }

    background =
      foreground === WHITE_RGB
        ? mixRgb(background, BLACK_RGB, 0.12)
        : mixRgb(background, WHITE_RGB, 0.12)

    foreground = pickForeground(background)
  }

  return background
}

function srgbToLinear(channel: number): number {
  const normalized = channel / 255
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

function relativeLuminance(rgb: RGB): number {
  const r = srgbToLinear(rgb.r)
  const g = srgbToLinear(rgb.g)
  const b = srgbToLinear(rgb.b)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: RGB, b: RGB): number {
  const luminanceA = relativeLuminance(a)
  const luminanceB = relativeLuminance(b)
  const light = Math.max(luminanceA, luminanceB)
  const dark = Math.min(luminanceA, luminanceB)
  return (light + 0.05) / (dark + 0.05)
}
