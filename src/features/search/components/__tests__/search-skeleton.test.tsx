import { describe, expect, it } from "vitest"

import { SearchSkeleton } from "@/features/search/components/search-skeleton"

import { renderWithProviders } from "../../../../../tests/test-utils"

describe("SearchSkeleton", () => {
  it("renders a busy region with three skeleton placeholders", () => {
    const { container } = renderWithProviders(<SearchSkeleton />)
    const region = container.firstElementChild as HTMLElement
    expect(region).toHaveAttribute("aria-busy")
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(3)
  })
})
