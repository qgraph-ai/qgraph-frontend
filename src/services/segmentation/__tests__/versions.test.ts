import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"

import { SEGMENTATION_PATHS } from "../paths"
import { getAllSegments, listSegments, listVersionTags } from "../versions"

import { server } from "../../../../tests/msw/server"

describe("listSegments", () => {
  it("hits the version-scoped segments path", async () => {
    let seenUrl = ""
    const publicId = "abcd-efgh"
    server.use(
      http.get(
        `${API_URL}/api/v1/segmentation/public/segmentation-versions/:publicId/segments/`,
        ({ request }) => {
          seenUrl = new URL(request.url).pathname
          return HttpResponse.json({
            count: 0,
            next: null,
            previous: null,
            results: [],
          })
        }
      )
    )

    await listSegments(publicId)

    expect(seenUrl).toBe(SEGMENTATION_PATHS.versionSegments(publicId))
  })

  it("forwards ordering and pagination params", async () => {
    let seenParams: URLSearchParams | null = null
    server.use(
      http.get(
        `${API_URL}/api/v1/segmentation/public/segmentation-versions/:publicId/segments/`,
        ({ request }) => {
          seenParams = new URL(request.url).searchParams
          return HttpResponse.json({
            count: 0,
            next: null,
            previous: null,
            results: [],
          })
        }
      )
    )

    await listSegments("p-id", {
      ordering: "start_ayah",
      page: 2,
      page_size: 50,
    })

    expect(seenParams!.get("ordering")).toBe("start_ayah")
    expect(seenParams!.get("page")).toBe("2")
    expect(seenParams!.get("page_size")).toBe("50")
  })
})

describe("getAllSegments", () => {
  it("paginates through all pages until next is null", async () => {
    let calls = 0
    server.use(
      http.get(
        `${API_URL}/api/v1/segmentation/public/segmentation-versions/:publicId/segments/`,
        ({ request }) => {
          calls += 1
          const params = new URL(request.url).searchParams
          const page = Number(params.get("page") ?? 1)
          const pageSize = Number(params.get("page_size") ?? 200)
          const total = 5
          const start = (page - 1) * pageSize
          const slice = Array.from(
            { length: Math.min(pageSize, Math.max(0, total - start)) },
            (_, i) => ({
              id: start + i + 1,
              public_id: `seg-${start + i + 1}`,
              start_ayah: start + i + 1,
              end_ayah: start + i + 1,
              title: "",
              summary: "",
              origin: "ai" as const,
              tags: [],
            })
          )
          const hasMore = start + pageSize < total
          return HttpResponse.json({
            count: total,
            next: hasMore
              ? `${API_URL}${SEGMENTATION_PATHS.versionSegments("multi-page")}?page=${page + 1}`
              : null,
            previous: null,
            results: slice,
          })
        }
      )
    )

    const segments = await getAllSegments("multi-page")
    expect(segments).toHaveLength(5)
    expect(segments[0].start_ayah).toBe(1)
    expect(segments[4].start_ayah).toBe(5)
    expect(calls).toBeGreaterThanOrEqual(1)
  })
})

describe("listVersionTags", () => {
  it("hits the version-scoped tags path", async () => {
    let seenUrl = ""
    const publicId = "tag-version-id"
    server.use(
      http.get(
        `${API_URL}/api/v1/segmentation/public/segmentation-versions/:publicId/tags/`,
        ({ request }) => {
          seenUrl = new URL(request.url).pathname
          return HttpResponse.json({
            count: 0,
            next: null,
            previous: null,
            results: [],
          })
        }
      )
    )

    await listVersionTags(publicId)

    expect(seenUrl).toBe(SEGMENTATION_PATHS.versionTags(publicId))
  })
})
