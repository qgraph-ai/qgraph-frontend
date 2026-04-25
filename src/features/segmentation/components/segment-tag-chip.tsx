import type { CSSProperties } from "react"

import { hexToSegmentColors } from "@/lib/color"
import type { Tag } from "@/services/segmentation"

export function SegmentTagChip({ tag }: { tag: Tag }) {
  const palette = hexToSegmentColors(tag.color)
  const tinted = palette !== null

  const style: CSSProperties | undefined = palette
    ? ({
        "--seg-tint-light": palette.tintLight,
        "--seg-tint-dark": palette.tintDark,
        "--seg-border-light": palette.borderLight,
        "--seg-border-dark": palette.borderDark,
      } as CSSProperties)
    : undefined

  return (
    <span
      data-segment-card
      data-tinted={tinted ? "" : undefined}
      style={style}
      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-[0.7rem] font-medium tracking-tight text-foreground/80"
    >
      <span className="truncate">{tag.name}</span>
    </span>
  )
}
