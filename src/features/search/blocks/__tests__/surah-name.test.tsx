import { renderHook, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { useSurahNames } from "@/features/search/blocks/surah-name"

import { server } from "../../../../../tests/msw/server"
import { TestProviders } from "../../../../../tests/test-utils"

describe("useSurahNames", () => {
  it("returns a Map keyed by surah number", async () => {
    server.use(
      http.get("*/api/v1/quran/surahs/", () =>
        HttpResponse.json({
          count: 2,
          next: null,
          previous: null,
          results: [
            { number: 1, arabic_name: "الفاتحة", transliteration: "al-Fātiḥah" },
            { number: 2, arabic_name: "البقرة", transliteration: "al-Baqarah" },
          ],
        })
      )
    )

    const { result } = renderHook(() => useSurahNames(), { wrapper: TestProviders })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.size).toBe(2)
    expect(result.current.data?.get(1)?.transliteration).toBe("al-Fātiḥah")
  })
})
