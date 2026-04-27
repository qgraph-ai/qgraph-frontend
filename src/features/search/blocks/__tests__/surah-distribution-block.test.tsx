import { http, HttpResponse } from "msw"
import { beforeAll, describe, expect, it } from "vitest"

import { SurahDistributionBlock } from "@/features/search/blocks/surah-distribution-block"
import type { SearchResponseBlock } from "@/services/search"

import { server } from "../../../../../tests/msw/server"
import { renderWithProviders, screen } from "../../../../../tests/test-utils"

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    Object.defineProperty(globalThis, "ResizeObserver", {
      writable: true,
      configurable: true,
      value: ResizeObserverStub,
    })
  }
})

function block(overrides: Partial<SearchResponseBlock> = {}): SearchResponseBlock {
  return {
    id: 1,
    block_type: "surah_distribution",
    order: 0,
    title: "Where mercy appears",
    payload: {
      values: [
        { surah: 1, value: 3 },
        { surah: 2, value: 17 },
      ],
      y_label: "Mentions",
    },
    explanation: "Counts include all forms.",
    confidence: 0.9,
    provenance: {},
    warning_text: "",
    items: [],
    ...overrides,
  }
}

describe("SurahDistributionBlock", () => {
  it("renders the heading and explanation when payload is valid", () => {
    server.use(
      http.get("*/api/v1/quran/surahs/", () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    )
    renderWithProviders(<SurahDistributionBlock block={block()} />)
    expect(screen.getByText("Where mercy appears")).toBeInTheDocument()
    expect(screen.getByText("Counts include all forms.")).toBeInTheDocument()
  })

  it("falls back to UnknownBlock for malformed payload", () => {
    renderWithProviders(
      <SurahDistributionBlock
        block={block({ payload: { values: "nope" } as unknown as Record<string, unknown> })}
      />
    )
    expect(screen.getByText("surah_distribution")).toBeInTheDocument()
  })
})
