import { describe, expect, it, vi } from "vitest"

import SegmentationPage, { generateMetadata } from "@/app/segmentation/page"

import { renderWithProviders, screen } from "../../../../tests/test-utils"

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}))

vi.mock("@/components/site-footer", () => ({
  SiteFooter: () => <div data-testid="site-footer" />,
}))

vi.mock("@/features/segmentation/components/segmentation-workbench", () => ({
  SegmentationWorkbench: () => <div data-testid="segmentation-workbench" />,
}))

vi.mock("@/services/segmentation", () => ({
  getFeaturedPublicWorkspace: async () => null,
  listPublicWorkspaces: async () => [],
}))

vi.mock("@/services/quran", () => ({
  listSurahs: async () => ({ count: 0, next: null, previous: null, results: [] }),
}))

describe("Segmentation page", () => {
  it("generates localized metadata", async () => {
    const metadata = await generateMetadata()
    expect(metadata.title).toBe("Segmentation Atlas")
    expect(metadata.alternates?.canonical).toBe("/segmentation")
  })

  it("renders segmentation shell route", async () => {
    const element = await SegmentationPage()
    renderWithProviders(element)

    expect(screen.getByTestId("site-header")).toBeInTheDocument()
    expect(screen.getByTestId("segmentation-workbench")).toBeInTheDocument()
    expect(screen.getByTestId("site-footer")).toBeInTheDocument()
  })
})
