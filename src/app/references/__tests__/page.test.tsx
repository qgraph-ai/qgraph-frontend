import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"

import ReferencesPage, { generateMetadata } from "@/app/references/page"
import { API_URL } from "@/lib/env"
import type { SourceReference } from "@/services/sources"
import { SOURCES_PATHS } from "@/services/sources/paths"

import { server } from "../../../../tests/msw/server"
import { renderWithProviders, screen } from "../../../../tests/test-utils"

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}))

vi.mock("@/components/site-footer", () => ({
  SiteFooter: () => <div data-testid="site-footer" />,
}))

vi.mock("@/features/references/components/source-card", () => ({
  SourceCard: ({ source }: { source: SourceReference }) => (
    <div data-testid="source-card" data-source-id={source.id}>
      <h2>{source.title}</h2>
    </div>
  ),
}))

describe("References page", () => {
  it("generates localized metadata", async () => {
    const metadata = await generateMetadata()
    expect(metadata.title).toBe("References")
    expect(metadata.alternates?.canonical).toBe("/references")
    expect(metadata.description).toMatch(/External sources/)
  })

  it("renders the page header and the default fixture sources", async () => {
    const element = await ReferencesPage()
    renderWithProviders(element)

    expect(
      screen.getByRole("heading", { level: 1, name: /Sources behind QGraph/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /Tanzil Quran Text/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /Quranic Arabic Corpus/ })
    ).toBeInTheDocument()
  })

  it("shows the empty state when no sources are returned", async () => {
    server.use(
      http.get(`${API_URL}${SOURCES_PATHS.list}`, () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    )

    const element = await ReferencesPage()
    renderWithProviders(element)

    expect(
      screen.getByRole("heading", { level: 2, name: /No references yet/i })
    ).toBeInTheDocument()
  })
})
