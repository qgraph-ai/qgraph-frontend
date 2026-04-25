import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Separator } from "@/components/ui/separator"
import { SURAH_COUNT } from "@/features/quran/lib/constants"
import { listSurahs } from "@/services/quran"
import type { Surah } from "@/services/quran"

type PagerNeighbor = { number: number; transliteration: string } | null

function neighbor(all: Surah[], number: number): PagerNeighbor {
  const found = all.find((s) => s.number === number)
  if (!found) return null
  return { number: found.number, transliteration: found.transliteration }
}

type ReaderNamespace = "quran.reader" | "segmentation.reader"

export async function SurahPager({
  current,
  basePath = "/quran",
  i18nNamespace = "quran.reader",
}: {
  current: number
  basePath?: string
  i18nNamespace?: ReaderNamespace
}) {
  const t = await getTranslations(i18nNamespace)
  const { results } = await listSurahs({
    page_size: SURAH_COUNT,
    ordering: "number",
  })

  const prev = current > 1 ? neighbor(results, current - 1) : null
  const next = current < SURAH_COUNT ? neighbor(results, current + 1) : null

  return (
    <nav
      aria-label={t("pagerLabel")}
      className="mx-auto mt-16 flex max-w-2xl items-stretch justify-between gap-4 border-t border-border/60 pt-8"
    >
      {prev ? (
        <Link
          href={`${basePath}/${prev.number}`}
          className="group flex flex-1 items-center gap-3 rounded-md px-2 py-3 outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-colors rtl:-scale-x-100 group-hover:text-foreground"
          />
          <span className="flex min-w-0 flex-col items-start gap-1">
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t("prevSurah")}
            </span>
            <span className="truncate text-sm tracking-tight text-foreground">
              {prev.transliteration}
            </span>
          </span>
        </Link>
      ) : (
        <span aria-hidden className="flex-1" />
      )}

      <Separator orientation="vertical" className="mx-2 opacity-60" />

      {next ? (
        <Link
          href={`${basePath}/${next.number}`}
          className="group flex flex-1 items-center justify-end gap-3 rounded-md px-2 py-3 text-end outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex min-w-0 flex-col items-end gap-1">
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t("nextSurah")}
            </span>
            <span className="truncate text-sm tracking-tight text-foreground">
              {next.transliteration}
            </span>
          </span>
          <ArrowRight
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground transition-colors rtl:-scale-x-100 group-hover:text-foreground"
          />
        </Link>
      ) : (
        <span aria-hidden className="flex-1" />
      )}
    </nav>
  )
}
