import Link from "next/link"

import { RevelationBadge } from "@/features/quran/components/revelation-badge"
import type { Surah } from "@/services/quran"

export function SurahRow({ surah }: { surah: Surah }) {
  return (
    <Link
      href={`/quran/${surah.number}`}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 rounded-lg px-2 py-5 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring md:gap-6 md:px-3"
    >
      <span
        aria-hidden
        className="inline-flex size-9 items-center justify-center rounded-full border border-border font-mono text-xs tabular-nums text-muted-foreground transition-colors group-hover:border-foreground/40 group-hover:text-foreground"
      >
        {String(surah.number).padStart(3, "0")}
      </span>

      <span className="flex min-w-0 flex-col gap-1">
        <span
          dir="rtl"
          lang="ar"
          className="truncate font-[family-name:var(--font-arabic)] text-xl leading-tight md:text-2xl"
        >
          {surah.arabic_name}
        </span>
        <span className="truncate text-sm tracking-tight text-muted-foreground">
          {surah.transliteration}
          {surah.english_name ? (
            <span className="ms-2 opacity-70">· {surah.english_name}</span>
          ) : null}
        </span>
      </span>

      <span className="flex flex-col items-end gap-1 text-end">
        {typeof surah.ayah_count === "number" ? (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {surah.ayah_count}
          </span>
        ) : null}
        {surah.revelation_place ? (
          <RevelationBadge place={surah.revelation_place} />
        ) : null}
      </span>
    </Link>
  )
}
