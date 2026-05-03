import { http, HttpResponse } from "msw"

import { API_URL } from "@/lib/env"
import { AUTH_PATHS } from "@/services/auth/paths"
import { QURAN_PATHS } from "@/services/quran/paths"
import type { Ayah, Surah } from "@/services/quran/types"
import { SEARCH_PATHS } from "@/services/search/paths"
import type {
  SearchExecutionSummary,
  SearchResponse,
  SearchSubmissionEnvelope,
} from "@/services/search/types"
import { SEGMENTATION_PATHS } from "@/services/segmentation/paths"
import type {
  SegmentWithTags,
  SegmentationVersion,
  Tag,
  Workspace,
} from "@/services/segmentation/types"
import { SOURCES_PATHS } from "@/services/sources/paths"
import type { SourceReference } from "@/services/sources/types"

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

export const FAKE_FEATURED_WORKSPACE: Workspace = {
  id: 1,
  slug: "public",
  title: "PUBLIC",
  description: "Public workspace",
  visibility: "public",
  is_featured: true,
  created_at: "2026-03-04T06:09:24.424844Z",
  updated_at: "2026-03-04T06:09:24.424848Z",
}

export const FAKE_VERSION_PUBLIC_ID = "53b1efe8-e4c4-4a93-b9f7-0b5cc34e595a"

export const FAKE_VERSIONS: SegmentationVersion[] = [
  {
    id: 485,
    public_id: FAKE_VERSION_PUBLIC_ID,
    workspace: 1,
    surah: 2,
    title: "AUTO Public Segmentation Surah 002",
    status: "active",
    origin: "ai",
    base_version: null,
    created_at: "2026-04-23T22:02:42.133465Z",
    updated_at: "2026-04-23T22:02:42.135401Z",
  },
]

const FAKE_TAGS: Tag[] = [
  {
    id: 1,
    public_id: "11111111-1111-1111-1111-111111111111",
    workspace: 1,
    name: "creation",
    color: "#22c55e",
    description: "",
    origin: "ai",
  },
  {
    id: 2,
    public_id: "22222222-2222-2222-2222-222222222222",
    workspace: 1,
    name: "judgment",
    color: "#a855f7",
    description: "",
    origin: "ai",
  },
]

export const FAKE_SEGMENTS: SegmentWithTags[] = [
  {
    id: 1,
    public_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    start_ayah: 1,
    end_ayah: 3,
    title: "Opening",
    summary: "",
    origin: "ai",
    tags: [FAKE_TAGS[0]],
  },
  {
    id: 2,
    public_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    start_ayah: 4,
    end_ayah: 7,
    title: "Reckoning",
    summary: "",
    origin: "ai",
    tags: [FAKE_TAGS[1]],
  },
]

export const segmentationHandlers = [
  http.get(url(SEGMENTATION_PATHS.featuredWorkspace), () =>
    HttpResponse.json(FAKE_FEATURED_WORKSPACE)
  ),

  http.get(
    `${API_URL}/api/v1/segmentation/public/workspaces/:slug/segmentation-versions/`,
    ({ request }) => {
      const params = new URL(request.url).searchParams
      const surah = params.get("surah")
      const filtered = surah
        ? FAKE_VERSIONS.filter((v) => v.surah === Number(surah))
        : FAKE_VERSIONS
      return HttpResponse.json({
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered,
      })
    }
  ),

  http.get(
    `${API_URL}/api/v1/segmentation/public/segmentation-versions/:publicId/segments/`,
    () =>
      HttpResponse.json({
        count: FAKE_SEGMENTS.length,
        next: null,
        previous: null,
        results: FAKE_SEGMENTS,
      })
  ),

  http.get(
    `${API_URL}/api/v1/segmentation/public/segmentation-versions/:publicId/tags/`,
    () =>
      HttpResponse.json({
        count: FAKE_TAGS.length,
        next: null,
        previous: null,
        results: FAKE_TAGS,
      })
  ),
]

export const FAKE_SEARCH_EXECUTION_ID = 5435

export const FAKE_SEARCH_RESPONSE: SearchResponse = {
  id: 4824,
  execution: FAKE_SEARCH_EXECUTION_ID,
  title: "Search results from Django",
  overall_confidence: 0.82,
  render_schema_version: "v1",
  metadata: {},
  blocks: [
    {
      id: 11850,
      block_type: "text",
      order: 0,
      title: "Mercy across the Qur'an",
      payload: {
        headline: "Server-rendered overview",
        details: "Paragraph one from Django.\n\nParagraph two from Django.",
      },
      explanation: "",
      confidence: 0.88,
      provenance: {},
      warning_text: "",
      items: [],
    },
  ],
  created_at: "2026-05-03T15:40:10.722688Z",
  updated_at: "2026-05-03T15:40:10.722696Z",
}

export const FAKE_SEARCH_ENVELOPE_ASYNC: SearchSubmissionEnvelope = {
  query_id: 1835,
  execution_id: FAKE_SEARCH_EXECUTION_ID,
  execution_status: "queued",
  mode: "async",
  guest_token: "guest-test-token",
  poll_url: `/api/v1/search/executions/${FAKE_SEARCH_EXECUTION_ID}/`,
  response_url: `/api/v1/search/executions/${FAKE_SEARCH_EXECUTION_ID}/response/`,
  response: null,
}

export const FAKE_SEARCH_EXECUTION_SUCCEEDED: SearchExecutionSummary = {
  id: FAKE_SEARCH_EXECUTION_ID,
  query_id: 1835,
  execution_number: 1,
  status: "succeeded",
  mode: "async",
  started_at: "2026-05-03T15:40:09.000Z",
  completed_at: "2026-05-03T15:40:10.722688Z",
  latency_ms: 1700,
  response_available: true,
  created_at: "2026-05-03T15:40:08.000Z",
  updated_at: "2026-05-03T15:40:10.722696Z",
}

export const searchHandlers = [
  http.post(url(SEARCH_PATHS.submit), () =>
    HttpResponse.json(FAKE_SEARCH_ENVELOPE_ASYNC, { status: 202 })
  ),

  http.get(`${API_URL}/api/v1/search/executions/:id/`, () =>
    HttpResponse.json(FAKE_SEARCH_EXECUTION_SUCCEEDED)
  ),

  http.get(`${API_URL}/api/v1/search/executions/:id/response/`, () =>
    HttpResponse.json(FAKE_SEARCH_RESPONSE)
  ),

  http.get(url(SEARCH_PATHS.bookmarks), () =>
    HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
  ),

  http.post(url(SEARCH_PATHS.bookmarks), async ({ request }) => {
    const body = (await request.json()) as {
      response_id?: number
      result_item_id?: number
      note?: string
    }
    const now = new Date().toISOString()
    return HttpResponse.json(
      {
        id: 1,
        response: body.response_id ?? null,
        result_item: body.result_item_id ?? null,
        note: body.note ?? "",
        created_at: now,
        updated_at: now,
      },
      { status: 201 }
    )
  }),

  http.delete(`${API_URL}/api/v1/search/bookmarks/:id/`, () =>
    new HttpResponse(null, { status: 204 })
  ),

  http.post(url(SEARCH_PATHS.feedback), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const now = new Date().toISOString()
    return HttpResponse.json(
      {
        id: 1,
        feedback_type: body.feedback_type,
        comment: body.comment ?? "",
        metadata: body.metadata ?? {},
        search_query: body.search_query_id ?? null,
        execution: body.execution_id ?? null,
        response: body.response_id ?? null,
        response_block: body.response_block_id ?? null,
        result_item: body.result_item_id ?? null,
        created_at: now,
        updated_at: now,
      },
      { status: 201 }
    )
  }),
]

export const FAKE_SOURCES: SourceReference[] = [
  {
    id: 1,
    title: "Tanzil Quran Text",
    source_type: "dataset",
    authors_or_organization: "Tanzil Project",
    year: 2021,
    url: "https://tanzil.net/",
    publisher: "Tanzil Project",
    identifier: "Version 1.1",
    description:
      "A highly verified Unicode Quran text provided by the Tanzil Project.",
    usage_note: "Used in QGraph as a source for Quran text and translations.",
    license_name: "Creative Commons Attribution 3.0",
    license_url: "https://tanzil.net/docs/text_license",
    accessed_at: "2026-05-03",
    display_order: 10,
  },
  {
    id: 2,
    title: "Quranic Arabic Corpus",
    source_type: "dataset",
    authors_or_organization: "",
    year: null,
    url: "https://corpus.quran.com/",
    publisher: "",
    identifier: "",
    description:
      "Annotated linguistic resource for the Holy Quran with morphological analysis.",
    usage_note: "",
    license_name: "",
    license_url: "",
    accessed_at: null,
    display_order: 20,
  },
]

export const sourcesHandlers = [
  http.get(url(SOURCES_PATHS.list), () =>
    HttpResponse.json({
      count: FAKE_SOURCES.length,
      next: null,
      previous: null,
      results: FAKE_SOURCES,
    })
  ),
]

export const handlers = [
  ...quranHandlers,
  ...segmentationHandlers,
  ...searchHandlers,
  ...sourcesHandlers,
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
