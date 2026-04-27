import { describe, expect, it } from "vitest"

import { BlockRenderer } from "@/features/search/blocks/block-renderer"
import type { SearchResponseBlock } from "@/services/search"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

function makeBlock(
  overrides: Partial<SearchResponseBlock> &
    Pick<SearchResponseBlock, "block_type" | "payload">
): SearchResponseBlock {
  return {
    id: 1,
    order: 0,
    title: "",
    explanation: "",
    confidence: null,
    provenance: {},
    warning_text: "",
    items: [],
    ...overrides,
  }
}

describe("BlockRenderer", () => {
  it("dispatches text blocks to the TextBlock renderer", () => {
    renderWithProviders(
      <BlockRenderer
        block={makeBlock({
          block_type: "text",
          title: "Headline goes here",
          payload: { details: "Body line one.\n\nBody line two." },
        })}
      />
    )
    expect(screen.getByText("Headline goes here")).toBeInTheDocument()
    expect(screen.getByText("Body line one.")).toBeInTheDocument()
    expect(screen.getByText("Body line two.")).toBeInTheDocument()
  })

  it("falls back to UnknownBlock for unregistered block types", () => {
    renderWithProviders(
      <BlockRenderer
        block={makeBlock({
          block_type: "future_chart_2099",
          title: "Mystery block",
          payload: { x: 1 },
        })}
      />
    )
    expect(screen.getByText("future_chart_2099")).toBeInTheDocument()
    expect(screen.getByText("Mystery block")).toBeInTheDocument()
  })

  it("UnknownBlock surfaces warning_text when present", () => {
    renderWithProviders(
      <BlockRenderer
        block={makeBlock({
          block_type: "future_block",
          title: "",
          payload: {},
          warning_text: "Heads up — this is experimental.",
        })}
      />
    )
    expect(
      screen.getByText("Heads up — this is experimental.")
    ).toBeInTheDocument()
  })
})
