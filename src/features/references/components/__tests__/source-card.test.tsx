import { describe, expect, it } from "vitest"

import { SourceCard } from "@/features/references/components/source-card"
import type { SourceReference } from "@/services/sources"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

const FULL: SourceReference = {
  id: 1,
  title: "Tanzil Quran Text",
  source_type: "dataset",
  authors_or_organization: "Tanzil Project",
  year: 2021,
  url: "https://tanzil.net/",
  publisher: "Tanzil Project",
  identifier: "Version 1.1",
  description:
    "A highly verified Unicode Quran text provided by the Tanzil Project.",
  usage_note: "Used in QGraph as a source for Quran text and translations.",
  license_name: "Creative Commons Attribution 3.0",
  license_url: "https://tanzil.net/docs/text_license",
  accessed_at: "2026-05-03",
  display_order: 10,
}

const MINIMAL: SourceReference = {
  id: 2,
  title: "Quranic Arabic Corpus",
  source_type: "dataset",
  authors_or_organization: "",
  year: null,
  url: "",
  publisher: "",
  identifier: "",
  description: "",
  usage_note: "",
  license_name: "",
  license_url: "",
  accessed_at: null,
  display_order: 20,
}

describe("SourceCard", () => {
  it("renders title, type badge, organization, description, usage note, and metadata", async () => {
    const element = await SourceCard({ source: FULL })
    renderWithProviders(element)

    expect(
      screen.getByRole("heading", { name: "Tanzil Quran Text" })
    ).toBeInTheDocument()
    expect(screen.getByText("Dataset")).toBeInTheDocument()
    // "Tanzil Project" appears as both organization and publisher.
    expect(screen.getAllByText("Tanzil Project")).toHaveLength(2)
    expect(
      screen.getByText(/highly verified Unicode Quran text/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Used in QGraph as a source for Quran text/)
    ).toBeInTheDocument()
    expect(screen.getByText("Publisher")).toBeInTheDocument()
    expect(screen.getByText("Identifier")).toBeInTheDocument()
    expect(screen.getByText("Version 1.1")).toBeInTheDocument()
    expect(screen.getByText("License")).toBeInTheDocument()
    expect(screen.getByText("Accessed")).toBeInTheDocument()
    expect(screen.getByText("2026")).toBeInTheDocument()
    expect(screen.getByText("2021")).toBeInTheDocument()
  })

  it("renders the visit link with target=_blank and rel=noopener noreferrer", async () => {
    const element = await SourceCard({ source: FULL })
    renderWithProviders(element)

    const link = screen.getByRole("link", { name: /Visit Tanzil Quran Text/i })
    expect(link).toHaveAttribute("href", "https://tanzil.net/")
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("renders the license as an external link when license_url is present", async () => {
    const element = await SourceCard({ source: FULL })
    renderWithProviders(element)

    const license = screen.getByRole("link", {
      name: /Creative Commons Attribution 3.0/,
    })
    expect(license).toHaveAttribute("href", "https://tanzil.net/docs/text_license")
    expect(license).toHaveAttribute("target", "_blank")
    expect(license).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("renders the license as plain text when license_url is missing", async () => {
    const element = await SourceCard({
      source: { ...FULL, license_url: "" },
    })
    renderWithProviders(element)

    expect(
      screen.queryByRole("link", { name: /Creative Commons Attribution 3.0/ })
    ).not.toBeInTheDocument()
    expect(
      screen.getByText("Creative Commons Attribution 3.0")
    ).toBeInTheDocument()
  })

  it("hides every optional field and link when only the required fields are present", async () => {
    const element = await SourceCard({ source: MINIMAL })
    renderWithProviders(element)

    expect(
      screen.getByRole("heading", { name: "Quranic Arabic Corpus" })
    ).toBeInTheDocument()
    expect(screen.queryByText("Publisher")).not.toBeInTheDocument()
    expect(screen.queryByText("Identifier")).not.toBeInTheDocument()
    expect(screen.queryByText("License")).not.toBeInTheDocument()
    expect(screen.queryByText("Accessed")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: /Visit/i })
    ).not.toBeInTheDocument()
  })

  it("omits the year row when year is null and accessed row when accessed_at is null", async () => {
    const element = await SourceCard({
      source: {
        ...FULL,
        year: null,
        accessed_at: null,
      },
    })
    renderWithProviders(element)

    expect(screen.queryByText("Accessed")).not.toBeInTheDocument()
    expect(screen.queryByText("2021")).not.toBeInTheDocument()
    expect(screen.queryByText("2026")).not.toBeInTheDocument()
  })
})
