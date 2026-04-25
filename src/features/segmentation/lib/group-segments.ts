import type { Ayah } from "@/services/quran"
import type { SegmentWithTags } from "@/services/segmentation"

export type SegmentBlock =
  | { kind: "segment"; segment: SegmentWithTags; ayahs: Ayah[] }
  | { kind: "gap"; ayahs: Ayah[] }

/**
 * Group consecutive ayahs by segment coverage. Backend `start_ayah` and
 * `end_ayah` are **global** ayah numbers (matching `Ayah.number_global`),
 * not in-surah ones, so all comparisons happen on `number_global`.
 *
 * Backend does not enforce gap-free or non-overlapping segmentation, so we:
 *   - sort segments by start_ayah ascending
 *   - emit covered ranges as `segment` blocks (clamped to the surah's
 *     in-memory ayah range)
 *   - emit uncovered ranges between/before/after segments as `gap` blocks
 *   - skip segments whose range overlaps a previously emitted segment
 *     (defensive — should not happen in valid data)
 */
export function groupSegments(
  ayahs: Ayah[],
  segments: SegmentWithTags[]
): SegmentBlock[] {
  if (ayahs.length === 0) return []

  const ordered = [...ayahs].sort(
    (a, b) => a.number_global - b.number_global
  )
  const byGlobal = new Map<number, Ayah>()
  for (const a of ordered) byGlobal.set(a.number_global, a)

  const minNum = ordered[0].number_global
  const maxNum = ordered[ordered.length - 1].number_global

  const sortedSegments = [...segments].sort(
    (a, b) => a.start_ayah - b.start_ayah
  )

  const blocks: SegmentBlock[] = []
  let cursor = minNum

  const ayahsInRange = (start: number, end: number): Ayah[] => {
    const out: Ayah[] = []
    for (let n = start; n <= end; n += 1) {
      const a = byGlobal.get(n)
      if (a) out.push(a)
    }
    return out
  }

  for (const segment of sortedSegments) {
    const start = Math.max(segment.start_ayah, minNum)
    const end = Math.min(segment.end_ayah, maxNum)
    if (start > end) continue
    if (start < cursor) continue

    if (cursor < start) {
      const gap = ayahsInRange(cursor, start - 1)
      if (gap.length > 0) blocks.push({ kind: "gap", ayahs: gap })
    }

    const segAyahs = ayahsInRange(start, end)
    if (segAyahs.length > 0) {
      blocks.push({ kind: "segment", segment, ayahs: segAyahs })
    }
    cursor = end + 1
  }

  if (cursor <= maxNum) {
    const gap = ayahsInRange(cursor, maxNum)
    if (gap.length > 0) blocks.push({ kind: "gap", ayahs: gap })
  }

  return blocks
}
