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

  it("renders the centered search experience when no query is provided", async () => {
    const element = await SearchPage({
      searchParams: Promise.resolve({}),
    })
    renderWithProviders(element)

    expect(
      screen.getByRole("heading", { name: /ask anything about the qur'an/i })
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/ask a question or enter a concept/i)
    ).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^search$/i })).toBeInTheDocument()
  })

  it("hydrates the search input from the q query parameter", async () => {
    const element = await SearchPage({
      searchParams: Promise.resolve({ q: "mercy" }),
    })
    renderWithProviders(element)

    expect(
      screen.getByPlaceholderText(/ask a question or enter a concept/i)
    ).toHaveValue("mercy")
  })
})
