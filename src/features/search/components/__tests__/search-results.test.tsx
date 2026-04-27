import { beforeEach, describe, expect, it, vi } from "vitest"

const useAuthMock = vi.hoisted(() => vi.fn())
vi.mock("@/features/auth/use-auth", () => ({
  useAuth: useAuthMock,
}))

import { SearchResults } from "@/features/search/components/search-results"
import type { SearchResponse } from "@/services/search"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

function response(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return {
    id: 1,
    execution: 1,
    title: "Mercy",
    overall_confidence: 0.6,
    render_schema_version: "v1",
    metadata: {},
    blocks: [
      {
        id: 11,
        block_type: "text",
        order: 0,
        title: "Headline",
        payload: { details: "Body." },
        explanation: "",
        confidence: null,
        provenance: {},
        warning_text: "",
        items: [],
      },
    ],
    created_at: "2026-04-26T00:00:00Z",
    updated_at: "2026-04-26T00:00:00Z",
    ...overrides,
  }
}

describe("SearchResults", () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({ status: "unauthenticated", user: null })
  })

  it("renders title, confidence, and blocks", () => {
    renderWithProviders(
      <SearchResults response={response()} isPartial={false} />
    )
    expect(screen.getByRole("heading", { name: "Mercy" })).toBeInTheDocument()
    expect(screen.getByText(/60% confidence/i)).toBeInTheDocument()
    expect(screen.getByText("Headline")).toBeInTheDocument()
    expect(screen.getByText("Body.")).toBeInTheDocument()
  })

  it("shows the partial banner when isPartial is true", () => {
    renderWithProviders(
      <SearchResults response={response()} isPartial={true} />
    )
    expect(
      screen.getByText(/some results are missing/i)
    ).toBeInTheDocument()
  })

  it("shows the empty notice when there are no blocks", () => {
    renderWithProviders(
      <SearchResults response={response({ blocks: [] })} isPartial={false} />
    )
    expect(
      screen.getByText(/the backend returned no result blocks/i)
    ).toBeInTheDocument()
  })

  it("omits the confidence kicker when overall_confidence is null", () => {
    renderWithProviders(
      <SearchResults
        response={response({ overall_confidence: null })}
        isPartial={false}
      />
    )
    expect(screen.queryByText(/% confidence/i)).toBeNull()
  })
})
