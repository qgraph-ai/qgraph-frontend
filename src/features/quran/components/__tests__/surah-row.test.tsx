import { describe, expect, it } from "vitest"

import type { Surah } from "@/services/quran"

import { SurahRow } from "../surah-row"

import {
  renderWithProviders,
  screen,
} from "../../../../../tests/test-utils"

function make(partial: Partial<Surah> = {}): Surah {
  return {
    number: 2,
    arabic_name: "ٱلْبَقَرَة",
    transliteration: "Al-Baqarah",
    english_name: "The Cow",
    ayah_count: 286,
    revelation_place: "medinan",
    ...partial,
  }
}

describe("SurahRow", () => {
  it("renders arabic name, transliteration, and links to the reader", () => {
    renderWithProviders(<SurahRow surah={make()} revelationLabel="Medinan" />)
    expect(screen.getByText("ٱلْبَقَرَة")).toBeInTheDocument()
    expect(screen.getByText(/Al-Baqarah/)).toBeInTheDocument()

    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/quran/2")
  })

  it("respects an override basePath", () => {
    renderWithProviders(
      <SurahRow surah={make()} basePath="/segmentation" revelationLabel="Medinan" />
    )
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/segmentation/2")
  })

  it("zero-pads the surah number to three digits", () => {
    renderWithProviders(
      <SurahRow surah={make({ number: 1 })} revelationLabel="Meccan" />
    )
    expect(screen.getByText("001")).toBeInTheDocument()
  })

  it("shows ayah count and revelation label when present", () => {
    renderWithProviders(<SurahRow surah={make()} revelationLabel="Medinan" />)
    expect(screen.getByText("286")).toBeInTheDocument()
    expect(screen.getByText("Medinan")).toBeInTheDocument()
  })

  it("renders english_name as a secondary label when present", () => {
    renderWithProviders(<SurahRow surah={make()} revelationLabel="Medinan" />)
    expect(screen.getByText(/The Cow/)).toBeInTheDocument()
  })

  it("omits meta cells when fields are absent", () => {
    renderWithProviders(
      <SurahRow
        surah={make({
          english_name: undefined,
          ayah_count: null,
          revelation_place: null,
        })}
      />
    )
    expect(screen.queryByText(/The Cow/)).not.toBeInTheDocument()
    expect(screen.queryByText("286")).not.toBeInTheDocument()
    expect(screen.queryByText(/Meccan|Medinan/i)).not.toBeInTheDocument()
  })
})
