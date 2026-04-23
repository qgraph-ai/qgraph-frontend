import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"

import { QURAN_PATHS } from "../paths"
import {
  getAllSurahAyahs,
  getSurah,
  listSurahAyahs,
  listSurahs,
} from "../surahs"

import { server } from "../../../../tests/msw/server"

describe("listSurahs", () => {
  it("returns the paginated result the backend sends", async () => {
    const data = await listSurahs()
    expect(data.results.length).toBeGreaterThan(0)
    expect(data.results[0]).toMatchObject({
      number: 1,
      arabic_name: expect.any(String),
      transliteration: "Al-Fātiḥah",
    })
  })

  it("forwards query params", async () => {
    let seenParams: URLSearchParams | null = null
    server.use(
      http.get(`${API_URL}${QURAN_PATHS.surahs}`, ({ request }) => {
        seenParams = new URL(request.url).searchParams
        return HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        })
      })
    )

    await listSurahs({ page: 2, page_size: 30, revelation_place: "meccan" })

    expect(seenParams!.get("page")).toBe("2")
    expect(seenParams!.get("page_size")).toBe("30")
    expect(seenParams!.get("revelation_place")).toBe("meccan")
  })
})

describe("getSurah", () => {
  it("hits the detail endpoint with the given number", async () => {
    const surah = await getSurah(2)
    expect(surah.number).toBe(2)
    expect(surah.transliteration).toBe("Al-Baqarah")
  })
})

describe("listSurahAyahs", () => {
  it("returns the first page when paginated", async () => {
    const page = await listSurahAyahs(2, { page: 1, page_size: 50 })
    expect(page.results.length).toBe(50)
    expect(page.results[0].number_in_surah).toBe(1)
    expect(page.next).not.toBeNull()
  })

  it("returns null next on the final page", async () => {
    const page = await listSurahAyahs(1, { page_size: 50 })
    expect(page.results.length).toBe(7)
    expect(page.next).toBeNull()
  })
})

describe("getAllSurahAyahs", () => {
  it("returns every ayah in a single-page surah", async () => {
    const ayahs = await getAllSurahAyahs(1)
    expect(ayahs).toHaveLength(7)
    expect(ayahs.map((a) => a.number_in_surah)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it("follows pagination and returns the full surah for multi-page results", async () => {
    let calls = 0
    // Matches the real backend's 200-item cap regardless of requested page_size.
    const BACKEND_CAP = 200
    server.use(
      http.get(`${API_URL}/api/v1/quran/surahs/:number/ayahs/`, ({ request }) => {
        calls += 1
        const params = new URL(request.url).searchParams
        const page = Number(params.get("page") ?? 1)
        const requested = Number(params.get("page_size") ?? BACKEND_CAP)
        const pageSize = Math.min(requested, BACKEND_CAP)
        const total = 286
        const start = (page - 1) * pageSize
        const items = Array.from(
          { length: Math.min(pageSize, Math.max(0, total - start)) },
          (_, i) => ({
            number_global: 2000 + start + i + 1,
            surah_number: 2,
            number_in_surah: start + i + 1,
            text_ar: `آية ${start + i + 1}`,
          })
        )
        const hasMore = start + pageSize < total
        return HttpResponse.json({
          count: total,
          next: hasMore
            ? `${API_URL}/api/v1/quran/surahs/2/ayahs/?page=${page + 1}&page_size=${pageSize}`
            : null,
          previous: null,
          results: items,
        })
      })
    )

    const ayahs = await getAllSurahAyahs(2)
    expect(ayahs).toHaveLength(286)
    expect(ayahs[0].number_in_surah).toBe(1)
    expect(ayahs[285].number_in_surah).toBe(286)
    expect(calls).toBeGreaterThan(1)
  })

  it("stops once next is null", async () => {
    let calls = 0
    // Use a surah number not in FAKE_SURAHS to avoid React cache() hits
    // from earlier tests that might have warmed the default handler.
    server.use(
      http.get(`${API_URL}/api/v1/quran/surahs/50/ayahs/`, () => {
        calls += 1
        return HttpResponse.json({
          count: 3,
          next: null,
          previous: null,
          results: [
            { number_global: 50001, surah_number: 50, number_in_surah: 1, text_ar: "" },
            { number_global: 50002, surah_number: 50, number_in_surah: 2, text_ar: "" },
            { number_global: 50003, surah_number: 50, number_in_surah: 3, text_ar: "" },
          ],
        })
      })
    )
    const ayahs = await getAllSurahAyahs(50)
    expect(calls).toBe(1)
    expect(ayahs).toHaveLength(3)
  })
})
