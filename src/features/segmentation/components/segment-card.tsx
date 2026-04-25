import type { CSSProperties } from "react"

import { toArabicDigits } from "@/features/quran/lib/format"
import { hexToSegmentColors } from "@/lib/color"
import type { Ayah } from "@/services/quran"
import type { SegmentWithTags } from "@/services/segmentation"

import { SegmentTagChip } from "./segment-tag-chip"

function pickSegmentColor(segment: SegmentWithTags): string | null {
  const tag = segment.tags.find((t) => t.color)
  return tag?.color ?? null
}

export function SegmentCard({
  segment,
  ayahs,
  ayahLabel,
}: {
  segment: SegmentWithTags
  ayahs: Ayah[]
  ayahLabel: (ayah: Ayah) => string
}) {
  const sourceColor = pickSegmentColor(segment)
  const palette = hexToSegmentColors(sourceColor)
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
    <article
      data-segment-card
      data-segment-public-id={segment.public_id}
      data-tinted={tinted ? "" : undefined}
      style={style}
      className="rounded-2xl border border-border/60 bg-card/40 px-4 py-3 transition-colors md:px-6 md:py-4"
    >
      {segment.tags.length > 0 ? (
        <ul
          role="list"
          className="mb-2 flex flex-wrap items-center gap-1.5"
        >
          {segment.tags.map((tag) => (
            <li key={tag.public_id}>
              <SegmentTagChip tag={tag} />
            </li>
          ))}
        </ul>
      ) : null}
      <ol role="list" className="divide-y divide-border/30 text-start">
        {ayahs.map((ayah) => (
          <li
            key={ayah.number_global}
            id={`ayah-${ayah.number_in_surah}`}
            className="scroll-mt-20 py-4 first:pt-1 last:pb-1"
          >
            <p
              dir="rtl"
              lang="ar"
              className="font-[family-name:var(--font-arabic)] text-2xl leading-[2.15] md:text-[2.1rem] md:leading-[2.1]"
            >
              {ayah.text_ar}
              <span
                aria-hidden
                className="ms-2 inline-flex select-none items-center text-foreground/70"
              >
                {"۝"}
                {toArabicDigits(ayah.number_in_surah)}
              </span>
            </p>
            <span className="sr-only">{ayahLabel(ayah)}</span>
          </li>
        ))}
      </ol>
    </article>
  )
}
