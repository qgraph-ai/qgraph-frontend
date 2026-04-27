"use client"

import { useTranslations } from "next-intl"

import { BlockRenderer } from "@/features/search/blocks/block-renderer"
import type { SearchResponse } from "@/services/search"

import { ResponseActions } from "./response-actions"

export function SearchResults({
  response,
  isPartial,
}: {
  response: SearchResponse
  isPartial: boolean
}) {
  const t = useTranslations("search.states")

  return (
    <section
      aria-label={response.title || undefined}
      className="space-y-4"
    >
      {response.title ? (
        <header className="space-y-1">
          <h1 className="text-xl font-medium leading-tight tracking-tight md:text-2xl">
            {response.title}
          </h1>
          {response.overall_confidence !== null ? (
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
              {Math.round((response.overall_confidence ?? 0) * 100)}% confidence
            </p>
          ) : null}
        </header>
      ) : null}

      {isPartial ? (
        <div
          role="status"
          className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
        >
          {t("partial")}
        </div>
      ) : null}

      {response.blocks.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="space-y-4">
          {response.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
        </div>
      )}

      <ResponseActions responseId={response.id} />
    </section>
  )
}
