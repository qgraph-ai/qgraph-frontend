import { describe, expect, it } from "vitest"

import { UnknownBlock } from "@/features/search/blocks/unknown-block"
import type { SearchResponseBlock } from "@/services/search"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

function block(overrides: Partial<SearchResponseBlock> = {}): SearchResponseBlock {
  return {
    id: 1,
    block_type: "future_type",
    order: 0,
    title: "",
    payload: { foo: 1 },
    explanation: "",
    confidence: null,
    provenance: {},
    warning_text: "",
    items: [],
    ...overrides,
  }
}

describe("UnknownBlock", () => {
  it("shows the block_type tag and a generic notice", () => {
    renderWithProviders(<UnknownBlock block={block()} />)
    expect(screen.getByText("future_type")).toBeInTheDocument()
    expect(
      screen.getByText(/isn't supported by the current frontend yet/i)
    ).toBeInTheDocument()
  })

  it("surfaces warning_text when present", () => {
    renderWithProviders(
      <UnknownBlock
        block={block({ warning_text: "Beta — handle with care." })}
      />
    )
    expect(screen.getByText("Beta — handle with care.")).toBeInTheDocument()
  })

  it("renders a heading when title is set", () => {
    renderWithProviders(
      <UnknownBlock block={block({ title: "Mystery" })} />
    )
    expect(screen.getByText("Mystery")).toBeInTheDocument()
  })
})
