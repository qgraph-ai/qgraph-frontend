import { describe, expect, it } from "vitest"

import { AppGrid } from "@/features/landing/app-grid"

import { renderWithProviders, screen } from "../../../../tests/test-utils"

describe("AppGrid", () => {
  it("renders navigation cards to quran, segmentation, and search", async () => {
    const element = await AppGrid()
    renderWithProviders(element)

    expect(screen.getByRole("link", { name: /qur'an/i })).toHaveAttribute(
      "href",
      "/quran"
    )
    expect(screen.getByRole("link", { name: /segmentation/i })).toHaveAttribute(
      "href",
      "/segmentation"
    )
    expect(
      screen.getByRole("link", { name: /advanced search/i })
    ).toHaveAttribute("href", "/search")
  })
})
