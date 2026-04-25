import { describe, expect, it } from "vitest"

import { Bismillah } from "@/features/quran/components/bismillah"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

describe("Bismillah", () => {
  it("uses translated accessibility label", async () => {
    const element = await Bismillah()
    renderWithProviders(element)

    expect(screen.getByLabelText(/bismillah/i)).toBeInTheDocument()
  })
})
