import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"

import { SurahFilter } from "@/features/search/components/surah-filter"

import { server } from "../../../../../tests/msw/server"
import {
  renderWithProviders,
  screen,
  waitFor,
} from "../../../../../tests/test-utils"

const surahsPayload = {
  count: 3,
  next: null,
  previous: null,
  results: [
    { number: 1, arabic_name: "الفاتحة", transliteration: "al-Fātiḥah" },
    { number: 2, arabic_name: "البقرة", transliteration: "al-Baqarah" },
    { number: 3, arabic_name: "آل عمران", transliteration: "Āl ʿImrān" },
  ],
}

describe("SurahFilter", () => {
  it("renders one row per surah and supports toggling, select-all, and clear", async () => {
    server.use(
      http.get("*/api/v1/quran/surahs/", () => HttpResponse.json(surahsPayload))
    )

    const onChange = vi.fn()
    const { rerender } = renderWithProviders(
      <SurahFilter selected={new Set()} onChange={onChange} />
    )

    await waitFor(() =>
      expect(screen.getByText("al-Fātiḥah")).toBeInTheDocument()
    )

    await userEvent.click(screen.getByLabelText(/al-Fātiḥah/i))
    expect(onChange).toHaveBeenCalledWith(new Set([1]))

    rerender(<SurahFilter selected={new Set([1])} onChange={onChange} />)
    await userEvent.click(screen.getByLabelText(/al-Fātiḥah/i))
    expect(onChange).toHaveBeenLastCalledWith(new Set())

    onChange.mockClear()
    await userEvent.click(screen.getByRole("button", { name: /select all/i }))
    expect(onChange).toHaveBeenCalledWith(new Set([1, 2, 3]))

    rerender(<SurahFilter selected={new Set([1, 2, 3])} onChange={onChange} />)
    onChange.mockClear()
    await userEvent.click(screen.getByRole("button", { name: /clear/i }))
    expect(onChange).toHaveBeenCalledWith(new Set())
  })

  it("renders an error message when the surah list fails to load", async () => {
    server.use(
      http.get("*/api/v1/quran/surahs/", () =>
        HttpResponse.json({ detail: "boom" }, { status: 500 })
      )
    )
    renderWithProviders(<SurahFilter selected={new Set()} onChange={() => {}} />)
    await waitFor(() =>
      expect(screen.getByText(/couldn't load surahs/i)).toBeInTheDocument()
    )
  })
})
