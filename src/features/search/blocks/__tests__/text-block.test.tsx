import { describe, expect, it } from "vitest"

import { TextBlock } from "@/features/search/blocks/text-block"
import type { SearchResponseBlock } from "@/services/search"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

function block(overrides: Partial<SearchResponseBlock> = {}): SearchResponseBlock {
  return {
    id: 1,
    block_type: "text",
    order: 0,
    title: "",
    payload: { details: "Body." },
    explanation: "",
    confidence: null,
    provenance: {},
    warning_text: "",
    items: [],
    ...overrides,
  }
}

describe("TextBlock", () => {
  it("splits multi-paragraph details on blank lines", () => {
    renderWithProviders(
      <TextBlock
        block={block({
          title: "Heading",
          payload: { details: "First paragraph.\n\nSecond paragraph." },
        })}
      />
    )
    expect(screen.getByText("Heading")).toBeInTheDocument()
    expect(screen.getByText("First paragraph.")).toBeInTheDocument()
    expect(screen.getByText("Second paragraph.")).toBeInTheDocument()
  })

  it("renders a single paragraph when details has no blank line", () => {
    renderWithProviders(
      <TextBlock block={block({ payload: { details: "Just one." } })} />
    )
    expect(screen.getByText("Just one.")).toBeInTheDocument()
  })

  it("renders the explanation hint when present", () => {
    renderWithProviders(
      <TextBlock block={block({ explanation: "Source: corpus." })} />
    )
    expect(screen.getByText("Source: corpus.")).toBeInTheDocument()
  })

  it("falls back to UnknownBlock when payload is malformed", () => {
    renderWithProviders(
      <TextBlock
        block={block({
          payload: { details: 123 } as unknown as Record<string, unknown>,
        })}
      />
    )
    // UnknownBlock surfaces the block_type tag
    expect(screen.getByText("text")).toBeInTheDocument()
  })
})
