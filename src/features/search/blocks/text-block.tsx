"use client"

import type { TextBlockPayload } from "@/services/search"

import { blockHeading, isTextPayload, type BlockProps } from "./block-types"
import { UnknownBlock } from "./unknown-block"

export function TextBlock({ block }: BlockProps) {
  if (!isTextPayload(block.payload)) {
    return <UnknownBlock block={block} />
  }

  const heading = blockHeading(block)
  const payload: TextBlockPayload = block.payload
  const paragraphs = payload.details
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <article className="rounded-2xl border border-border/60 bg-card/40 p-5 md:p-6">
      {heading ? (
        <h2 className="text-base font-medium leading-snug tracking-tight text-foreground">
          {heading}
        </h2>
      ) : null}
      {block.explanation ? (
        <p className="mt-1 text-xs text-muted-foreground">{block.explanation}</p>
      ) : null}
      <div
        className={
          heading || block.explanation
            ? "mt-3 space-y-3 text-sm leading-relaxed text-foreground/90"
            : "space-y-3 text-sm leading-relaxed text-foreground/90"
        }
      >
        {paragraphs.length === 0 ? (
          <p className="text-sm leading-relaxed text-foreground/90">
            {payload.details}
          </p>
        ) : (
          paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))
        )}
      </div>
    </article>
  )
}
