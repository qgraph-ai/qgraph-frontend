import { describe, expect, it } from "vitest"

import type { Surah } from "@/services/quran"

import { SurahHeader } from "../surah-header"

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

async function renderHeader(surah: Surah) {
  const el = await SurahHeader({ surah })
  return renderWithProviders(el)
}

describe("SurahHeader", () => {
  it("renders the zero-padded kicker, arabic name, and transliteration", async () => {
    await renderHeader(make({ number: 2 }))
    expect(screen.getByText("Surah 002")).toBeInTheDocument()

    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toHaveAttribute("id", "surah-2-name")
    expect(heading).toHaveTextContent("ٱلْبَقَرَة")

    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument()
  })

  it("shows meta when ayah_count and revelation_place are present", async () => {
    await renderHeader(make())
    expect(screen.getByText(/286 āyāt · Medinan/i)).toBeInTheDocument()
  })

  it("omits english_name and meta when absent", async () => {
    await renderHeader(
      make({ english_name: undefined, ayah_count: null, revelation_place: null })
    )
    expect(screen.queryByText(/The Cow/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Meccan|Medinan/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/āyāt/)).not.toBeInTheDocument()
  })

  it("shows only revelation when ayah_count is missing", async () => {
    await renderHeader(
      make({ ayah_count: null, revelation_place: "meccan" })
    )
    expect(screen.getByText(/^\s*Meccan\s*$/i)).toBeInTheDocument()
    expect(screen.queryByText(/āyāt/)).not.toBeInTheDocument()
  })
})
