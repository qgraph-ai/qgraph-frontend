"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { useSearchResult } from "@/features/search/hooks/use-search-result"
import { useSearchSubmit } from "@/features/search/hooks/use-search-submit"
import { cn } from "@/lib/utils"
import type { SearchFilters } from "@/services/search"

import { SearchBar } from "./search-bar"
import { SearchError } from "./search-error"
import { SearchResults } from "./search-results"
import { SearchSkeleton } from "./search-skeleton"

export function SearchExperience({
  initialQuery,
}: {
  initialQuery: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = (searchParams.get("q") ?? "").trim()
  const t = useTranslations("search")
  const tStates = useTranslations("search.states")

  const [inputValue, setInputValue] = useState(initialQuery || urlQuery)
  const [selectedSurahs, setSelectedSurahs] = useState<Set<number>>(
    () => new Set()
  )
  const filtersRef = useRef<SearchFilters>({})
  filtersRef.current =
    selectedSurahs.size > 0
      ? { surahs: Array.from(selectedSurahs).sort((a, b) => a - b) }
      : {}

  const submit = useSearchSubmit()
  const lastFiredQueryRef = useRef<string | null>(null)

  const result = useSearchResult(submit.data ?? null)

  useEffect(() => {
    if (!urlQuery) {
      lastFiredQueryRef.current = null
      return
    }
    if (lastFiredQueryRef.current === urlQuery) return
    lastFiredQueryRef.current = urlQuery
    setInputValue(urlQuery)
    submit.mutate({ query: urlQuery, filters: filtersRef.current })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery])

  function handleSubmit() {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    lastFiredQueryRef.current = trimmed
    submit.mutate({ query: trimmed, filters: filtersRef.current })
    if (trimmed !== urlQuery) {
      const params = new URLSearchParams()
      params.set("q", trimmed)
      router.push(`/search?${params.toString()}`, { scroll: false })
    }
  }

  function handleRetry() {
    const trimmed = inputValue.trim() || urlQuery
    if (!trimmed) return
    lastFiredQueryRef.current = trimmed
    submit.mutate({ query: trimmed, filters: filtersRef.current })
  }

  const hasSubmission = Boolean(submit.data) || submit.isPending
  const showTopLayout = hasSubmission || Boolean(urlQuery)

  return (
    <div
      className={cn(
        "transition-[padding] duration-300 ease-out motion-reduce:transition-none",
        showTopLayout ? "pt-6 md:pt-10" : "pt-20 md:pt-32"
      )}
    >
      {!showTopLayout ? (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 px-6 pb-16 text-center">
          <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t("kicker")}
          </p>
          <h1 className="text-3xl font-medium leading-tight tracking-tight md:text-4xl">
            {t("heading")}
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            {t("subheading")}
          </p>
          <div className="mt-2 w-full">
            <SearchBar
              value={inputValue}
              onChange={setInputValue}
              selectedSurahs={selectedSurahs}
              onSurahsChange={setSelectedSurahs}
              onSubmit={handleSubmit}
              isLoading={submit.isPending}
              variant="centered"
            />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <div className="sticky top-0 z-20 -mx-6 bg-background/85 px-6 pb-3 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <SearchBar
              value={inputValue}
              onChange={setInputValue}
              selectedSurahs={selectedSurahs}
              onSurahsChange={setSelectedSurahs}
              onSubmit={handleSubmit}
              isLoading={submit.isPending}
              variant="top"
            />
          </div>

          <div className="mt-6">
            {submit.isError ? (
              <SearchError
                title={tStates("submitErrorTitle")}
                message={submit.error?.message}
                onRetry={handleRetry}
              />
            ) : result.phase === "polling" ||
              result.phase === "fetching" ||
              submit.isPending ? (
              <SearchSkeleton />
            ) : result.phase === "succeeded" || result.phase === "partial" ? (
              result.response ? (
                <SearchResults
                  response={result.response}
                  isPartial={result.phase === "partial"}
                />
              ) : (
                <SearchSkeleton />
              )
            ) : result.phase === "failed" ||
              result.phase === "canceled" ? (
              <SearchError
                title={tStates("executionFailedTitle")}
                message={result.error?.message}
                onRetry={handleRetry}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
