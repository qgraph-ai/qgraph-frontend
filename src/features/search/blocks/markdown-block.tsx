"use client"

import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

import type { MarkdownBlockPayload } from "@/services/search"

import { blockHeading, isMarkdownPayload, type BlockProps } from "./block-types"
import { UnknownBlock } from "./unknown-block"

const MARKDOWN_COMPONENTS: Components = {
  h1: ({ children }) => (
    <h3 className="mt-4 text-lg font-medium leading-snug tracking-tight text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 className="mt-4 text-base font-medium leading-snug tracking-tight text-foreground first:mt-0">
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 className="mt-3 text-sm font-medium uppercase tracking-wide text-muted-foreground first:mt-0">
      {children}
    </h5>
  ),
  h4: ({ children }) => (
    <h6 className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground first:mt-0">
      {children}
    </h6>
  ),
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-foreground/90">{children}</p>
  ),
  a: ({ href, children }) => {
    const external =
      typeof href === "string" && /^https?:\/\//i.test(href)
    return (
      <a
        href={href}
        className="text-primary underline-offset-4 hover:underline"
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    )
  },
  ul: ({ children }) => (
    <ul className="ms-5 list-disc space-y-1 text-sm leading-relaxed text-foreground/90">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="ms-5 list-decimal space-y-1 text-sm leading-relaxed text-foreground/90">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="ps-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-s-2 border-border ps-4 italic text-foreground/80">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ className, children, ...props }) => {
    const isBlock =
      typeof className === "string" && className.startsWith("language-")
    if (isBlock) {
      return (
        <code className={`${className} text-xs`} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code
        className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 text-start font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/40 px-3 py-2 align-top text-foreground/90">
      {children}
    </td>
  ),
}

export function MarkdownBlock({ block }: BlockProps) {
  if (!isMarkdownPayload(block.payload)) {
    return <UnknownBlock block={block} />
  }

  const heading = blockHeading(block)
  const payload: MarkdownBlockPayload = block.payload

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
      <div className={heading || block.explanation ? "mt-3 space-y-3" : "space-y-3"}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={MARKDOWN_COMPONENTS}
        >
          {payload.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
