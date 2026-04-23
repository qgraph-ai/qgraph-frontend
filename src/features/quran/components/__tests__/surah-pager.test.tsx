import { http, HttpResponse } from "msw"
import { beforeEach, describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"
import { QURAN_PATHS } from "@/services/quran/paths"
import type { Surah } from "@/services/quran/types"

import { SurahPager } from "../surah-pager"

import { server } from "../../../../../tests/msw/server"
import {
  renderWithProviders,
  screen,
} from "../../../../../tests/test-utils"

function stubSurahList() {
  // Provide minimal entries for all 114 numbers so neighbour lookup works.
  const results: Surah[] = Array.from({ length: 114 }, (_, i) => ({
    number: i + 1,
    arabic_name: `سوره${i + 1}`,
    transliteration: `Surah${i + 1}`,
  }))
  server.use(
    http.get(`${API_URL}${QURAN_PATHS.surahs}`, () =>
      HttpResponse.json({
        count: results.length,
        next: null,
        previous: null,
        results,
      })
    )
  )
}

describe("SurahPager", () => {
  beforeEach(() => {
    stubSurahList()
  })

  it("omits the previous link on the first surah", async () => {
    const el = await SurahPager({ current: 1 })
    renderWithProviders(el)

    const nextLink = screen.getByRole("link", { name: /Next.*Surah2/i })
    expect(nextLink).toHaveAttribute("href", "/quran/2")
    expect(
      screen.queryByRole("link", { name: /Previous/i })
    ).not.toBeInTheDocument()
  })

  it("omits the next link on the last surah", async () => {
    const el = await SurahPager({ current: 114 })
    renderWithProviders(el)

    const prevLink = screen.getByRole("link", { name: /Previous.*Surah113/i })
    expect(prevLink).toHaveAttribute("href", "/quran/113")
    expect(screen.queryByRole("link", { name: /Next/i })).not.toBeInTheDocument()
  })

  it("renders both neighbours for a middle surah", async () => {
    const el = await SurahPager({ current: 50 })
    renderWithProviders(el)

    expect(
      screen.getByRole("link", { name: /Previous.*Surah49/i })
    ).toHaveAttribute("href", "/quran/49")
    expect(
      screen.getByRole("link", { name: /Next.*Surah51/i })
    ).toHaveAttribute("href", "/quran/51")
  })
})
