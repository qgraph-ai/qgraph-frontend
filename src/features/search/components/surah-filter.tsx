"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { useSurahNames } from "@/features/search/blocks/surah-name"
import { cn } from "@/lib/utils"

export function SurahFilter({
  selected,
  onChange,
}: {
  selected: ReadonlySet<number>
  onChange: (next: Set<number>) => void
}) {
  const t = useTranslations("search.filters")
  const surahsQuery = useSurahNames()
  const surahs = surahsQuery.data
  const sorted = surahs
    ? Array.from(surahs.values()).sort((a, b) => a.number - b.number)
    : []

  function toggle(number: number) {
    const next = new Set(selected)
    if (next.has(number)) {
      next.delete(number)
    } else {
      next.add(number)
    }
    onChange(next)
  }

  function selectAll() {
    if (!surahs) return
    onChange(new Set(sorted.map((s) => s.number)))
  }

  function clearAll() {
    onChange(new Set())
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          {t("surahs")}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={selectAll}
            disabled={!surahs}
          >
            {t("selectAll")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={clearAll}
            disabled={selected.size === 0}
          >
            {t("clear")}
          </Button>
        </div>
      </div>

      {surahsQuery.isPending ? (
        <SurahFilterSkeleton />
      ) : surahsQuery.isError ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("loadError")}</p>
      ) : (
        <ul
          role="list"
          className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {sorted.map((surah) => {
            const id = `surah-filter-${surah.number}`
            const checked = selected.has(surah.number)
            return (
              <li key={surah.number}>
                <label
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm transition-colors",
                    "hover:bg-muted/60",
                    checked ? "text-foreground" : "text-foreground/85"
                  )}
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() => toggle(surah.number)}
                  />
                  <span className="tabular-nums text-muted-foreground">
                    {surah.number}.
                  </span>
                  <span className="truncate">{surah.transliteration}</span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function SurahFilterSkeleton() {
  return (
    <ul
      role="list"
      className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      aria-busy
    >
      {Array.from({ length: 20 }).map((_, index) => (
        <li key={index}>
          <Skeleton className="h-6 w-full rounded-md" />
        </li>
      ))}
    </ul>
  )
}
