import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"

import { SEGMENTATION_PATHS } from "../paths"
import {
  getFeaturedWorkspace,
  listSegmentationVersions,
} from "../workspaces"

import { server } from "../../../../tests/msw/server"

describe("getFeaturedWorkspace", () => {
  it("returns the featured public workspace from the backend", async () => {
    const ws = await getFeaturedWorkspace()
    expect(ws.slug).toBe("public")
    expect(ws.is_featured).toBe(true)
    expect(ws.visibility).toBe("public")
  })
})

describe("listSegmentationVersions", () => {
  it("forwards surah, status, and ordering query params", async () => {
    let seenParams: URLSearchParams | null = null
    server.use(
      http.get(
        `${API_URL}/api/v1/segmentation/public/workspaces/:slug/segmentation-versions/`,
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

    await listSegmentationVersions("public", {
      surah: 5,
      status: "active",
      ordering: "recent",
    })

    expect(seenParams!.get("surah")).toBe("5")
    expect(seenParams!.get("status")).toBe("active")
    expect(seenParams!.get("ordering")).toBe("recent")
  })

  it("hits the slug-scoped path", async () => {
    let seenUrl = ""
    server.use(
      http.get(
        `${API_URL}/api/v1/segmentation/public/workspaces/:slug/segmentation-versions/`,
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

    await listSegmentationVersions("custom-slug")

    expect(seenUrl).toBe(SEGMENTATION_PATHS.workspaceVersions("custom-slug"))
  })
})
