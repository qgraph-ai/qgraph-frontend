"use client"

import { blockHeading, type BlockProps } from "./block-types"

export function UnknownBlock({ block }: BlockProps) {
  const heading = blockHeading(block)
  const isDev = process.env.NODE_ENV !== "production"

  return (
    <article className="rounded-2xl border border-dashed border-border/80 bg-muted/30 p-5 text-sm md:p-6">
      <header className="flex flex-wrap items-center gap-2">
        <span className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
          {block.block_type}
        </span>
        {heading ? (
          <h2 className="text-base font-medium leading-snug text-foreground">
            {heading}
          </h2>
        ) : null}
      </header>
      {block.warning_text ? (
        <p className="mt-2 text-sm text-muted-foreground">{block.warning_text}</p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          This block type isn&apos;t supported by the current frontend yet.
        </p>
      )}
      {isDev ? (
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer text-muted-foreground">
            Show raw payload
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-background p-3 text-[0.75rem] leading-relaxed">
            {JSON.stringify(block.payload, null, 2)}
          </pre>
        </details>
      ) : null}
    </article>
  )
}
