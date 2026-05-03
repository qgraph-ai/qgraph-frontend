import type {
  MarkdownBlockPayload,
  SearchResponseBlock,
  SurahDistributionPayload,
  TextBlockPayload,
} from "@/services/search"

export type BlockProps = {
  block: SearchResponseBlock
}

export function isTextPayload(payload: unknown): payload is TextBlockPayload {
  if (typeof payload !== "object" || payload === null) return false
  const candidate = payload as Record<string, unknown>
  return typeof candidate.details === "string"
}

export function isMarkdownPayload(
  payload: unknown
): payload is MarkdownBlockPayload {
  if (typeof payload !== "object" || payload === null) return false
  const candidate = payload as Record<string, unknown>
  return typeof candidate.content === "string"
}

export function isSurahDistributionPayload(
  payload: unknown
): payload is SurahDistributionPayload {
  if (typeof payload !== "object" || payload === null) return false
  const candidate = payload as Record<string, unknown>
  if (!Array.isArray(candidate.values)) return false
  return candidate.values.every((entry) => {
    if (typeof entry !== "object" || entry === null) return false
    const e = entry as Record<string, unknown>
    return typeof e.surah === "number" && typeof e.value === "number"
  })
}

export function blockHeading(block: SearchResponseBlock): string {
  if (block.title?.trim()) return block.title
  const payload = block.payload as { headline?: unknown } | null
  if (payload && typeof payload.headline === "string" && payload.headline.trim()) {
    return payload.headline
  }
  return ""
}
