const FALLBACK_PATH = "/"

function isSafeInternalPath(value: string): boolean {
  if (!value.startsWith("/")) return false
  if (value.startsWith("//")) return false
  if (value.includes("\n") || value.includes("\r")) return false
  return true
}

export function sanitizeReturnTo(
  input: string | null | undefined,
  fallback = FALLBACK_PATH
): string {
  const trimmed = input?.trim()
  if (!trimmed) return fallback
  if (!isSafeInternalPath(trimmed)) return fallback
  return trimmed
}

