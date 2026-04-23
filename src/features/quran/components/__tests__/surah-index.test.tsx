import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"
import { QURAN_PATHS } from "@/services/quran/paths"

import { SurahIndex } from "../surah-index"

import { server } from "../../../../../tests/msw/server"
import {
  renderWithProviders,
  screen,
} from "../../../../../tests/test-utils"

describe("SurahIndex", () => {
  it("renders one link per surah returned by the backend", async () => {
    const el = await SurahIndex()
    renderWithProviders(el)

    const links = screen.getAllByRole("link")
    expect(links.length).toBe(4)
    expect(screen.getByText("Al-Fātiḥah")).toBeInTheDocument()
    expect(screen.getByText("Al-Baqarah")).toBeInTheDocument()
    expect(screen.getByText("At-Tawbah")).toBeInTheDocument()
    expect(screen.getByText("An-Nās")).toBeInTheDocument()
  })

  it("renders an empty list when the backend returns no results", async () => {
    server.use(
      http.get(`${API_URL}${QURAN_PATHS.surahs}`, () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    )
    const el = await SurahIndex()
    renderWithProviders(el)
    expect(screen.queryAllByRole("link")).toHaveLength(0)
  })
})
