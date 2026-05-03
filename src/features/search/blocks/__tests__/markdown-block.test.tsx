import { describe, expect, it } from "vitest"

import { MarkdownBlock } from "@/features/search/blocks/markdown-block"
import type { SearchResponseBlock } from "@/services/search"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

function block(
  overrides: Partial<SearchResponseBlock> = {}
): SearchResponseBlock {
  return {
    id: 1,
    block_type: "markdown",
    order: 0,
    title: "",
    payload: { content: "" },
    explanation: "",
    confidence: null,
    provenance: {},
    warning_text: "",
    items: [],
    ...overrides,
  }
}

describe("MarkdownBlock", () => {
  it("renders headings, paragraphs, and emphasis", () => {
    renderWithProviders(
      <MarkdownBlock
        block={block({
          title: "Concept overview",
          payload: {
            content: "# Heading One\n\nA paragraph with **bold** and *italic* text.",
          },
        })}
      />
    )
    expect(
      screen.getByRole("heading", { level: 2, name: "Concept overview" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { level: 3, name: "Heading One" })
    ).toBeInTheDocument()
    expect(screen.getByText("bold")).toBeInTheDocument()
    expect(screen.getByText("italic")).toBeInTheDocument()
  })

  it("renders ordered and unordered lists", () => {
    renderWithProviders(
      <MarkdownBlock
        block={block({
          payload: {
            content: "- alpha\n- beta\n\n1. first\n2. second",
          },
        })}
      />
    )
    expect(screen.getByText("alpha")).toBeInTheDocument()
    expect(screen.getByText("beta")).toBeInTheDocument()
    expect(screen.getByText("first")).toBeInTheDocument()
    expect(screen.getByText("second")).toBeInTheDocument()
  })

  it("renders inline code and fenced code blocks", () => {
    renderWithProviders(
      <MarkdownBlock
        block={block({
          payload: {
            content: "Use `useState` here.\n\n```ts\nconst x = 1\n```",
          },
        })}
      />
    )
    expect(screen.getByText("useState")).toBeInTheDocument()
    expect(screen.getByText(/const x = 1/)).toBeInTheDocument()
  })

  it("renders GFM tables", () => {
    renderWithProviders(
      <MarkdownBlock
        block={block({
          payload: {
            content:
              "| Surah | Mentions |\n| --- | ---: |\n| Al-Fatihah | 3 |\n| Al-Baqarah | 17 |",
          },
        })}
      />
    )
    expect(screen.getByRole("table")).toBeInTheDocument()
    expect(
      screen.getByRole("columnheader", { name: "Surah" })
    ).toBeInTheDocument()
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument()
    expect(screen.getByText("17")).toBeInTheDocument()
  })

  it("opens external links in a new tab with safe rel", () => {
    renderWithProviders(
      <MarkdownBlock
        block={block({
          payload: {
            content: "See [Quran.com](https://quran.com) and [#anchor](#section).",
          },
        })}
      />
    )
    const external = screen.getByRole("link", { name: "Quran.com" })
    expect(external).toHaveAttribute("target", "_blank")
    expect(external).toHaveAttribute("rel", "noopener noreferrer")
    const anchor = screen.getByRole("link", { name: "#anchor" })
    expect(anchor).not.toHaveAttribute("target")
  })

  it("escapes raw HTML in markdown by default", () => {
    renderWithProviders(
      <MarkdownBlock
        block={block({
          payload: {
            content: "<script>alert('xss')</script>",
          },
        })}
      />
    )
    expect(document.querySelector("script")).toBeNull()
  })

  it("falls back to UnknownBlock when payload.content is missing", () => {
    renderWithProviders(
      <MarkdownBlock
        block={block({
          payload: {} as unknown as Record<string, unknown>,
        })}
      />
    )
    expect(screen.getByText("markdown")).toBeInTheDocument()
  })

  it("renders the explanation hint when present", () => {
    renderWithProviders(
      <MarkdownBlock
        block={block({
          explanation: "Synthesized from corpus tags.",
          payload: { content: "body" },
        })}
      />
    )
    expect(
      screen.getByText("Synthesized from corpus tags.")
    ).toBeInTheDocument()
  })
})
