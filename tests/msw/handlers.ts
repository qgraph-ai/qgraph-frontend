import { http, HttpResponse } from "msw"

import { API_URL } from "@/lib/env"
import { AUTH_PATHS } from "@/services/auth/paths"
import { QURAN_PATHS } from "@/services/quran/paths"
import type { Ayah, Surah } from "@/services/quran/types"

const url = (path: string) => `${API_URL}${path}`

export const FAKE_SURAHS: Surah[] = [
  {
    number: 1,
    arabic_name: "ٱلْفَاتِحَة",
    transliteration: "Al-Fātiḥah",
    english_name: "The Opening",
    ayah_count: 7,
    revelation_place: "meccan",
  },
  {
    number: 2,
    arabic_name: "ٱلْبَقَرَة",
    transliteration: "Al-Baqarah",
    english_name: "The Cow",
    ayah_count: 286,
    revelation_place: "medinan",
  },
  {
    number: 9,
    arabic_name: "ٱلتَّوْبَة",
    transliteration: "At-Tawbah",
    english_name: "The Repentance",
    ayah_count: 129,
    revelation_place: "medinan",
  },
  {
    number: 114,
    arabic_name: "ٱلنَّاس",
    transliteration: "An-Nās",
    english_name: "Mankind",
    ayah_count: 6,
    revelation_place: "meccan",
  },
]

function fakeAyah(surahNumber: number, numberInSurah: number): Ayah {
  return {
    number_global: surahNumber * 1000 + numberInSurah,
    surah_number: surahNumber,
    number_in_surah: numberInSurah,
    text_ar: `آية ${numberInSurah}`,
  }
}

export const quranHandlers = [
  http.get(url(QURAN_PATHS.surahs), ({ request }) => {
    const params = new URL(request.url).searchParams
    const pageSize = Number(params.get("page_size") ?? 20)
    const page = Number(params.get("page") ?? 1)
    const start = (page - 1) * pageSize
    const sliced = FAKE_SURAHS.slice(start, start + pageSize)
    return HttpResponse.json({
      count: FAKE_SURAHS.length,
      next: null,
      previous: null,
      results: sliced,
    })
  }),

  http.get(`${API_URL}/api/v1/quran/surahs/:number/`, ({ params }) => {
    const number = Number(params.number)
    const found = FAKE_SURAHS.find((s) => s.number === number)
    if (!found) return HttpResponse.json({ detail: "Not found" }, { status: 404 })
    return HttpResponse.json(found)
  }),

  http.get(`${API_URL}/api/v1/quran/surahs/:number/ayahs/`, ({ params, request }) => {
    const number = Number(params.number)
    const surah = FAKE_SURAHS.find((s) => s.number === number)
    if (!surah?.ayah_count) {
      return HttpResponse.json(
        { count: 0, next: null, previous: null, results: [] },
        { status: 200 }
      )
    }
    const search = new URL(request.url).searchParams
    const pageSize = Number(search.get("page_size") ?? 20)
    const page = Number(search.get("page") ?? 1)
    const all = Array.from({ length: surah.ayah_count }, (_, i) =>
      fakeAyah(number, i + 1)
    )
    const start = (page - 1) * pageSize
    const slice = all.slice(start, start + pageSize)
    const hasMore = start + pageSize < all.length
    return HttpResponse.json({
      count: all.length,
      next: hasMore
        ? `${API_URL}/api/v1/quran/surahs/${number}/ayahs/?page=${page + 1}&page_size=${pageSize}`
        : null,
      previous: null,
      results: slice,
    })
  }),
]

export const handlers = [
  ...quranHandlers,
  http.get(url(AUTH_PATHS.csrf), () =>
    HttpResponse.json(
      { csrfToken: "test-csrf-token" },
      {
        headers: {
          "set-cookie": "csrftoken=test-csrf-token; Path=/; SameSite=Lax",
        },
      }
    )
  ),

  http.post(url(AUTH_PATHS.jwtCreate), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.email === "inactive@example.com") {
      return HttpResponse.json(
        { detail: "No active account found with the given credentials" },
        { status: 401 }
      )
    }
    if (body.password === "wrong") {
      return HttpResponse.json(
        { detail: "No active account found with the given credentials" },
        { status: 401 }
      )
    }
    return HttpResponse.json({}, { status: 200 })
  }),

  http.post(url(AUTH_PATHS.jwtRefresh), () => HttpResponse.json({}, { status: 200 })),
  http.post(url(AUTH_PATHS.jwtLogout), () => HttpResponse.json({}, { status: 200 })),

  http.get(url(AUTH_PATHS.me), () =>
    HttpResponse.json(
      {
        id: 1,
        email: "user@example.com",
        first_name: "",
        last_name: "",
      },
      { status: 200 }
    )
  ),

  http.post(url(AUTH_PATHS.register), async ({ request }) => {
    const body = (await request.json()) as {
      email: string
      password: string
      re_password: string
    }
    if (body.email === "taken@example.com") {
      return HttpResponse.json(
        { email: ["user with this email already exists."] },
        { status: 400 }
      )
    }
    return HttpResponse.json(
      { id: 1, email: body.email, first_name: "", last_name: "" },
      { status: 201 }
    )
  }),

  http.post(url(AUTH_PATHS.activate), async ({ request }) => {
    const body = (await request.json()) as { uid: string; token: string }
    if (body.token === "bad") {
      return HttpResponse.json(
        { token: ["Invalid token for given user."] },
        { status: 400 }
      )
    }
    return HttpResponse.json({}, { status: 204 })
  }),

  http.post(url(AUTH_PATHS.resendActivation), () =>
    HttpResponse.json({}, { status: 204 })
  ),

  http.post(url(AUTH_PATHS.resetPassword), () =>
    HttpResponse.json({}, { status: 204 })
  ),

  http.post(url(AUTH_PATHS.resetPasswordConfirm), async ({ request }) => {
    const body = (await request.json()) as {
      uid: string
      token: string
      new_password: string
    }
    if (body.token === "bad") {
      return HttpResponse.json(
        { token: ["Invalid token for given user."] },
        { status: 400 }
      )
    }
    return HttpResponse.json({}, { status: 204 })
  }),
]
