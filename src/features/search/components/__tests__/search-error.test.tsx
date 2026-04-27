import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { SearchError } from "@/features/search/components/search-error"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

describe("SearchError", () => {
  it("renders the default title and body and omits the retry button when no onRetry is provided", () => {
    renderWithProviders(<SearchError />)
    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /try again/i })).toBeNull()
  })

  it("uses the override title and message and surfaces a retry button", async () => {
    const onRetry = vi.fn()
    renderWithProviders(
      <SearchError title="Bad" message="Boom" onRetry={onRetry} />
    )
    expect(screen.getByText("Bad")).toBeInTheDocument()
    expect(screen.getByText("Boom")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()
  })
})
