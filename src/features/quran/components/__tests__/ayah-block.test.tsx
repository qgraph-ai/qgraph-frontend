import { describe, expect, it } from "vitest"

import type { Ayah } from "@/services/quran"

import { AyahBlock } from "../ayah-block"

import {
  renderWithProviders,
  screen,
} from "../../../../../tests/test-utils"

function ayah(partial: Partial<Ayah> = {}): Ayah {
  return {
    number_global: 1,
    surah_number: 1,
    number_in_surah: 7,
    text_ar: "ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
    ...partial,
  }
}

describe("AyahBlock", () => {
  it("renders arabic text and a deep-link anchor for the ayah number", () => {
    renderWithProviders(<AyahBlock ayah={ayah()} />)
    expect(
      screen.getByText(/ٱلَّذِينَ أَنْعَمْتَ/)
    ).toBeInTheDocument()

    const li = screen.getByText(/ٱلَّذِينَ أَنْعَمْتَ/).closest("li")
    expect(li).toHaveAttribute("id", "ayah-7")
  })

  it("renders the end-of-ayah marker with Arabic-Indic digits", () => {
    renderWithProviders(<AyahBlock ayah={ayah({ number_in_surah: 286 })} />)
    // U+06DD + Arabic-Indic digits for 286 = ٢٨٦
    expect(screen.getByText(/۝٢٨٦/)).toBeInTheDocument()
  })

  it("includes a screen-reader label with the ayah ordinal", () => {
    renderWithProviders(
      <AyahBlock ayah={ayah({ number_in_surah: 42, surah_number: 2 })} />
    )
    expect(screen.getByText(/Ayah 42 of surah 2/i)).toBeInTheDocument()
  })
})
