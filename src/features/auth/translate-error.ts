"use client"

export function translateFieldError(
  t: (key: string) => string,
  tHas: (key: string) => boolean,
  message: string | undefined | null
): string | undefined {
  if (!message) return undefined
  if (tHas(message)) return t(message)
  return message
}
