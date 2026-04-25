import { describe, expect, it, vi } from "vitest"

import SegmentationPage, { generateMetadata } from "@/app/segmentation/page"

import { renderWithProviders, screen } from "../../../../tests/test-utils"

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}))

vi.mock("@/components/site-footer", () => ({
  SiteFooter: () => <div data-testid="site-footer" />,
}))

describe("Segmentation page", () => {
  it("generates localized metadata", async () => {
    const metadata = await generateMetadata()
    expect(metadata.title).toBe("Segmentation")
    expect(metadata.alternates?.canonical).toBe("/segmentation")
  })

  it("renders coherent coming-soon content", async () => {
    const element = await SegmentationPage()
    renderWithProviders(element)

    expect(
      screen.getByRole("heading", { name: /segmentation is coming soon/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: /back to landing/i })
    ).toHaveAttribute("href", "/")
  })
})
