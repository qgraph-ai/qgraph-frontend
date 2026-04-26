"use client"

import { ChevronDownIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState, type CSSProperties } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { toArabicDigits } from "@/features/quran/lib/format"
import { hexToSegmentColors } from "@/lib/color"
import { cn } from "@/lib/utils"
import type { Ayah } from "@/services/quran"
import type { SegmentWithTags } from "@/services/segmentation"

import { SegmentTagChip } from "./segment-tag-chip"

function pickSegmentColor(segment: SegmentWithTags): string | null {
  const tag = segment.tags.find((t) => t.color)
  return tag?.color ?? null
}

function hasContent(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0
}

export function SegmentCard({
  segment,
  ayahs,
}: {
  segment: SegmentWithTags
  ayahs: Ayah[]
}) {
  const t = useTranslations("segmentation.reader")
  const [open, setOpen] = useState(false)

  const ayahLabel = (ayah: Ayah) =>
    t("ayahScreenReaderLabel", {
      ayah: ayah.number_in_surah,
      surah: ayah.surah_number,
    })

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

  const showTitle = hasContent(segment.title)
  const showSummary = hasContent(segment.summary)
  const hasTheme = showTitle || showSummary

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <article
        data-segment-card
        data-segment-public-id={segment.public_id}
        data-tinted={tinted ? "" : undefined}
        style={style}
        className="rounded-2xl border border-border/60 bg-card/40 px-4 py-3 transition-colors md:px-6 md:py-4"
      >
        {(segment.tags.length > 0 || hasTheme) && (
          <div className="mb-2 flex items-center gap-1.5">
            {segment.tags.length > 0 ? (
              <ul
                role="list"
                className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5"
              >
                {segment.tags.map((tag) => (
                  <li key={tag.public_id}>
                    <SegmentTagChip tag={tag} />
                  </li>
                ))}
              </ul>
            ) : (
              <span className="flex-1" aria-hidden />
            )}

            {hasTheme ? (
              <CollapsibleTrigger
                aria-label={t("toggleSegmentTheme")}
                className={cn(
                  "ms-auto inline-flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors",
                  "hover:bg-muted/60 hover:text-foreground",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                )}
              >
                <ChevronDownIcon
                  aria-hidden
                  className="size-4 transition-transform duration-200 data-[state=open]:rotate-180"
                  data-state={open ? "open" : "closed"}
                />
              </CollapsibleTrigger>
            ) : null}
          </div>
        )}

        {hasTheme ? (
          <CollapsibleContent
            className={cn(
              "overflow-hidden",
              "data-[state=open]:animate-collapsible-down",
              "data-[state=closed]:animate-collapsible-up"
            )}
          >
            <div className="border-y border-border/40 py-3">
              {showTitle ? (
                <h2 className="text-sm font-medium tracking-tight text-foreground/90">
                  {segment.title}
                </h2>
              ) : null}
              {showSummary ? (
                <p
                  className={cn(
                    "text-sm leading-relaxed text-muted-foreground",
                    showTitle ? "mt-1" : ""
                  )}
                >
                  {segment.summary}
                </p>
              ) : null}
            </div>
          </CollapsibleContent>
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
    </Collapsible>
  )
}
