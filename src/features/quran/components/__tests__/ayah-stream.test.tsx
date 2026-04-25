import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"

import { AyahStream } from "../ayah-stream"

import { server } from "../../../../../tests/msw/server"
import {
  renderWithProviders,
  screen,
} from "../../../../../tests/test-utils"

describe("AyahStream", () => {
  it("renders every ayah a short surah returns (no pagination)", async () => {
    const el = await AyahStream({ surahNumber: 114 })
    renderWithProviders(el)

    // An-Nās has 6 ayahs in FAKE_SURAHS
    expect(screen.getAllByRole("listitem")).toHaveLength(6)
    expect(screen.getByText(/Ayah 1 of surah 114/i)).toBeInTheDocument()
  })

  it("aggregates ayahs across paginated responses transparently", async () => {
    // Force a 3-page response (TOTAL=7, page size = 3)
    const TOTAL = 7
    const PAGE_SIZE = 3
    server.use(
      http.get(
        `${API_URL}/api/v1/quran/surahs/:number/ayahs/`,
        ({ request, params }) => {
          const surahNumber = Number(params.number)
          const search = new URL(request.url).searchParams
          const page = Number(search.get("page") ?? 1)
          const start = (page - 1) * PAGE_SIZE
          const items = Array.from(
            { length: Math.min(PAGE_SIZE, Math.max(0, TOTAL - start)) },
            (_, i) => ({
              number_global: surahNumber * 10000 + start + i + 1,
              surah_number: surahNumber,
              number_in_surah: start + i + 1,
              text_ar: `آية ${start + i + 1}`,
            })
          )
          const hasMore = start + PAGE_SIZE < TOTAL
          return HttpResponse.json({
            count: TOTAL,
            next: hasMore ? `/next?page=${page + 1}` : null,
            previous: null,
            results: items,
          })
        }
      )
    )

    // Use a surah number not in FAKE_SURAHS so React's cache() doesn't
    // return an earlier test's result.
    const el = await AyahStream({ surahNumber: 77 })
    renderWithProviders(el)

    expect(screen.getAllByRole("listitem")).toHaveLength(TOTAL)
    expect(screen.getByText(/آية 1/)).toBeInTheDocument()
    expect(screen.getByText(/آية 7/)).toBeInTheDocument()
  })
})
