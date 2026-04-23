import { getTranslations } from "next-intl/server"

import { BrandOrnament } from "@/components/brand-mark"
import { Separator } from "@/components/ui/separator"
import { padSurahNumber } from "@/features/quran/lib/format"
import type { Surah } from "@/services/quran"

export async function SurahHeader({ surah }: { surah: Surah }) {
  const t = await getTranslations("quran.reader")
  const headingId = `surah-${surah.number}-name`

  const metaParts: string[] = []
  if (typeof surah.ayah_count === "number") {
    metaParts.push(t("ayahCount", { count: surah.ayah_count }))
  }
  if (surah.revelation_place === "meccan") metaParts.push(t("meccan"))
  else if (surah.revelation_place === "medinan") metaParts.push(t("medinan"))

  return (
    <header className="mx-auto flex max-w-2xl flex-col items-center gap-6 pt-20 pb-12 text-center md:pt-28">
      <span className="inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
        <BrandOrnament className="size-2.5 opacity-70" />
        <span className="tabular-nums">
          {t("kickerTemplate", { number: padSurahNumber(surah.number) })}
        </span>
        <BrandOrnament className="size-2.5 opacity-70" />
      </span>

      <h1
        id={headingId}
        dir="rtl"
        lang="ar"
        className="font-[family-name:var(--font-arabic)] text-5xl leading-[1.25] md:text-6xl md:leading-[1.2]"
      >
        {surah.arabic_name}
      </h1>

      <div className="flex flex-col items-center gap-1">
        <p className="text-lg tracking-tight text-foreground/90 md:text-xl">
          {surah.transliteration}
        </p>
        {surah.english_name ? (
          <p className="text-sm text-muted-foreground">{surah.english_name}</p>
        ) : null}
      </div>

      {metaParts.length > 0 ? (
        <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          {metaParts.join(" · ")}
        </p>
      ) : null}

      <Separator className="mt-4 w-12 opacity-60" />
    </header>
  )
}
