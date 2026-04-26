import type { SegmentWithTags } from "@/services/segmentation"

export function pickSegmentColor(segment: SegmentWithTags): string | null {
  const tag = segment.tags.find((t) => t.color)
  return tag?.color ?? null
}
