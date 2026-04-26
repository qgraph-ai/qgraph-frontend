import type { SegmentBlock } from "./group-segments"
import { pickSegmentColor } from "./pick-segment-color"

export type SpineItem =
  | {
      kind: "segment"
      targetId: string
      index: number
      chars: number
      color: string | null
      title: string
      rangeStart: number
      rangeEnd: number
    }
  | {
      kind: "gap"
      targetId: string
      chars: number
      rangeStart: number
      rangeEnd: number
    }

export type SpineItemsResult = {
  items: SpineItem[]
  totalChars: number
}

function blockChars(block: SegmentBlock): number {
  return block.ayahs.reduce(
    (sum, ayah) => sum + (ayah.text_ar?.length ?? 0),
    0
  )
}

/**
 * Map the output of `groupSegments` into a flat list of items the
 * `<ThemeSpine>` can render. Each item carries the character count of
 * its block (used for proportional sizing via flex-grow), the surah-
 * local ayah range (used in tooltips), and a stable `targetId` that
 * matches the DOM id we set on the corresponding `<SegmentCard>` /
 * `<UncoveredBlock>`.
 *
 * Returns `{ items: [], totalChars: 0 }` for an empty input — the
 * caller can use that to skip rendering the spine entirely.
 */
export function buildSpineItems(blocks: SegmentBlock[]): SpineItemsResult {
  let segmentIndex = 0
  let totalChars = 0
  const items: SpineItem[] = []

  for (const block of blocks) {
    const chars = blockChars(block)
    totalChars += chars
    const first = block.ayahs[0]
    const last = block.ayahs[block.ayahs.length - 1]
    if (!first || !last) continue
    const rangeStart = first.number_in_surah
    const rangeEnd = last.number_in_surah

    if (block.kind === "segment") {
      segmentIndex += 1
      items.push({
        kind: "segment",
        targetId: `segment-${block.segment.public_id}`,
        index: segmentIndex,
        chars,
        color: pickSegmentColor(block.segment),
        title: block.segment.title ?? "",
        rangeStart,
        rangeEnd,
      })
    } else {
      items.push({
        kind: "gap",
        targetId: `gap-${first.number_global}`,
        chars,
        rangeStart,
        rangeEnd,
      })
    }
  }

  return { items, totalChars }
}
