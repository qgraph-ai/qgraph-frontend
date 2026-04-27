"use client"

import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { type FormEvent, useId, useState } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { SurahFilter } from "./surah-filter"

export function SearchBar({
  value,
  onChange,
  selectedSurahs,
  onSurahsChange,
  onSubmit,
  isLoading,
  variant,
}: {
  value: string
  onChange: (next: string) => void
  selectedSurahs: ReadonlySet<number>
  onSurahsChange: (next: Set<number>) => void
  onSubmit: () => void
  isLoading: boolean
  variant: "centered" | "top"
}) {
  const t = useTranslations("search")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const inputId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!value.trim()) return
    onSubmit()
  }

  const filterCount = selectedSurahs.size

  return (
    <div className={cn("w-full")}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-border/60 bg-card/60 p-2 shadow-[inset_0_1px_0_0_oklch(1_0_0_/_0.05)] transition-colors focus-within:border-ring/60",
          variant === "centered" ? "md:p-2.5" : ""
        )}
      >
        <SearchIcon
          aria-hidden
          className="ms-2 size-4 shrink-0 text-muted-foreground"
        />
        <label htmlFor={inputId} className="sr-only">
          {t("placeholder")}
        </label>
        <Input
          id={inputId}
          type="text"
          dir="auto"
          inputMode="search"
          autoComplete="off"
          enterKeyHint="search"
          placeholder={t("placeholder")}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 flex-1 border-0 bg-transparent px-1 text-base shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-base"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !value.trim()}
          className="shrink-0"
        >
          {t("submit")}
        </Button>
      </form>

      <Collapsible
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        className="mt-2"
      >
        <div className="flex items-center justify-end">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-expanded={filtersOpen}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <SlidersHorizontalIcon aria-hidden className="size-3.5" />
              <span>
                {t("filters.label")}
                {filterCount > 0 ? ` · ${filterCount}` : ""}
              </span>
              <ChevronDownIcon
                aria-hidden
                className={cn(
                  "size-3.5 transition-transform",
                  filtersOpen ? "rotate-180" : ""
                )}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
          <div className="mt-2">
            <SurahFilter
              selected={selectedSurahs}
              onChange={onSurahsChange}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
