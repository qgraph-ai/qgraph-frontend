import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"

import { SOURCES_PATHS } from "../paths"
import { listSources } from "../sources"
import type { SourceReference } from "../types"

import { server } from "../../../../tests/msw/server"

const SAMPLE: SourceReference = {
  id: 99,
  title: "Sample Source",
  source_type: "paper",
  authors_or_organization: "Sample Author",
  year: 2024,
  url: "https://example.com/",
  publisher: "Sample Press",
  identifier: "doi:10.0/sample",
  description: "A sample.",
  usage_note: "",
  license_name: "",
  license_url: "",
  accessed_at: null,
  display_order: 5,
}

describe("listSources", () => {
  it("returns results from a paginated envelope response", async () => {
    server.use(
      http.get(`${API_URL}${SOURCES_PATHS.list}`, () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [SAMPLE],
        })
      )
    )

    const sources = await listSources()
    expect(sources).toHaveLength(1)
    expect(sources[0].title).toBe("Sample Source")
  })

  it("returns the array directly when the backend responds with a plain array", async () => {
    server.use(
      http.get(`${API_URL}${SOURCES_PATHS.list}`, () =>
        HttpResponse.json([SAMPLE])
      )
    )

    const sources = await listSources()
    expect(sources).toHaveLength(1)
    expect(sources[0].id).toBe(99)
  })

  it("rejects with a normalized error on a 500 response", async () => {
    server.use(
      http.get(`${API_URL}${SOURCES_PATHS.list}`, () =>
        HttpResponse.json({ detail: "boom" }, { status: 500 })
      )
    )

    await expect(listSources()).rejects.toMatchObject({ status: 500 })
  })
})
