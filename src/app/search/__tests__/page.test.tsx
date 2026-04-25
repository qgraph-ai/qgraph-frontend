import { describe, expect, it, vi } from "vitest"

import SearchPage, { generateMetadata } from "@/app/search/page"

import { renderWithProviders, screen } from "../../../../tests/test-utils"

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}))

vi.mock("@/components/site-footer", () => ({
  SiteFooter: () => <div data-testid="site-footer" />,
}))

describe("Search page", () => {
  it("generates localized metadata", async () => {
    const metadata = await generateMetadata()
    expect(metadata.title).toBe("Advanced Search")
    expect(metadata.alternates?.canonical).toBe("/search")
  })

  it("renders coming-soon content and echoes the query", async () => {
    const element = await SearchPage({
      searchParams: Promise.resolve({ q: "mercy" }),
    })
    renderWithProviders(element)

    expect(
      screen.getByRole("heading", { name: /advanced search is coming soon/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/you searched for/i)).toBeInTheDocument()
    expect(screen.getByText("mercy")).toBeInTheDocument()
  })

  it("renders empty-query helper text when no query exists", async () => {
    const element = await SearchPage({
      searchParams: Promise.resolve({}),
    })
    renderWithProviders(element)

    expect(screen.getByText(/no query provided/i)).toBeInTheDocument()
  })
})
