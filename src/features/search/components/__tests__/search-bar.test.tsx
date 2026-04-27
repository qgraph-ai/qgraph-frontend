import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw"
import { describe, expect, it, vi } from "vitest"

import { SearchBar } from "@/features/search/components/search-bar"

import { server } from "../../../../../tests/msw/server"
import {
  renderWithProviders,
  screen,
} from "../../../../../tests/test-utils"

function setup(props?: Partial<React.ComponentProps<typeof SearchBar>>) {
  const onChange = vi.fn()
  const onSubmit = vi.fn()
  const onSurahsChange = vi.fn()
  const utils = renderWithProviders(
    <SearchBar
      value=""
      onChange={onChange}
      selectedSurahs={new Set()}
      onSurahsChange={onSurahsChange}
      onSubmit={onSubmit}
      isLoading={false}
      variant="centered"
      {...props}
    />
  )
  return { onChange, onSubmit, onSurahsChange, ...utils }
}

describe("SearchBar", () => {
  it("disables the submit button when the value is blank", () => {
    setup()
    const submit = screen.getByRole("button", { name: /^search$/i })
    expect(submit).toBeDisabled()
  })

  it("calls onChange as the user types", async () => {
    const { onChange } = setup()
    const input = screen.getByPlaceholderText(/ask a question or enter a concept/i)
    await userEvent.type(input, "x")
    expect(onChange).toHaveBeenCalled()
  })

  it("submits when the user presses Enter on a non-empty value", async () => {
    const { onSubmit } = setup({ value: "ready" })
    const input = screen.getByPlaceholderText(/ask a question or enter a concept/i)
    input.focus()
    await userEvent.keyboard("{Enter}")
    expect(onSubmit).toHaveBeenCalled()
  })

  it("does nothing on submit when the value is whitespace only", async () => {
    const { onSubmit } = setup({ value: "   " })
    const submit = screen.getByRole("button", { name: /^search$/i })
    expect(submit).toBeDisabled()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("expands the filters disclosure when the trigger is clicked", async () => {
    server.use(
      http.get("*/api/v1/quran/surahs/", () =>
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
      )
    )
    setup()
    const trigger = screen.getByRole("button", { name: /filters/i })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    await userEvent.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
  })

  it("shows the selected surah count next to the filters label", () => {
    setup({ selectedSurahs: new Set([1, 2]) })
    expect(screen.getByText(/filters · 2/i)).toBeInTheDocument()
  })
})
