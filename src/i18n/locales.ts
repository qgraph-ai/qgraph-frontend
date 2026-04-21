export const LOCALES = ["en", "fa"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "en"
export const LOCALE_COOKIE = "NEXT_LOCALE"

export function isLocale(value: string | undefined | null): value is Locale {
  return value !== null && value !== undefined && (LOCALES as readonly string[]).includes(value)
}

export function directionFor(locale: Locale): "ltr" | "rtl" {
  return locale === "fa" ? "rtl" : "ltr"
}
