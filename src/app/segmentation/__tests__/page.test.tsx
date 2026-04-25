import { describe, expect, it, vi } from "vitest"

import SegmentationIndexPage, {
  generateMetadata,
} from "@/app/segmentation/page"

import { renderWithProviders, screen } from "../../../../tests/test-utils"

vi.mock("@/components/site-header", () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}))

vi.mock("@/components/site-footer", () => ({
  SiteFooter: () => <div data-testid="site-footer" />,
}))

const surahIndexSpy = vi.fn()
vi.mock("@/features/quran/components/surah-index", () => ({
  SurahIndex: (props: { basePath?: string }) => {
    surahIndexSpy(props)
    return <div data-testid="surah-index" data-base-path={props.basePath} />
  },
}))

describe("Segmentation index page", () => {
  it("generates localized metadata", async () => {
    const metadata = await generateMetadata()
    expect(metadata.title).toBe("Segmentation")
    expect(metadata.alternates?.canonical).toBe("/segmentation")
  })

  it("renders the segmentation header and passes basePath to SurahIndex", async () => {
    const element = await SegmentationIndexPage()
    renderWithProviders(element)

    expect(
      screen.getByRole("heading", { name: /map of meaning/i })
    ).toBeInTheDocument()

    const stub = screen.getByTestId("surah-index")
    expect(stub).toHaveAttribute("data-base-path", "/segmentation")
  })
})
