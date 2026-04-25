import { fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { SegmentationVersion } from "@/services/segmentation"

import { VersionPicker } from "../version-picker"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

const replaceMock = vi.fn()
const pathname = "/segmentation/2"
let currentSearch = ""

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(currentSearch),
}))

function v(partial: Partial<SegmentationVersion> = {}): SegmentationVersion {
  return {
    id: 1,
    public_id: "v-1",
    workspace: 1,
    surah: 2,
    title: "Version 1",
    status: "active",
    origin: "ai",
    base_version: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...partial,
  }
}

describe("VersionPicker", () => {
  it("does not render when there is at most one version", () => {
    const { container } = renderWithProviders(
      <VersionPicker versions={[v()]} currentPublicId="v-1" />
    )
    expect(container.firstChild).toBeNull()
  })

  it("renders a labelled trigger when multiple versions are present", () => {
    renderWithProviders(
      <VersionPicker
        versions={[v(), v({ public_id: "v-2", title: "Version 2" })]}
        currentPublicId="v-1"
      />
    )
    expect(
      screen.getByRole("combobox", { name: /segmentation version/i })
    ).toBeInTheDocument()
  })

  it("calls router.replace with ?v=<public_id> when a different version is picked", () => {
    replaceMock.mockClear()
    currentSearch = ""
    renderWithProviders(
      <VersionPicker
        versions={[v(), v({ public_id: "v-2", title: "Version 2" })]}
        currentPublicId="v-1"
      />
    )

    const trigger = screen.getByRole("combobox")
    fireEvent.keyDown(trigger, { key: "Enter" })
    const option = screen.getByRole("option", { name: "Version 2" })
    fireEvent.click(option)

    expect(replaceMock).toHaveBeenCalledTimes(1)
    expect(replaceMock).toHaveBeenCalledWith(
      "/segmentation/2?v=v-2",
      expect.objectContaining({ scroll: false })
    )
  })

  it("preserves other query params when changing version", () => {
    replaceMock.mockClear()
    currentSearch = "foo=bar"
    renderWithProviders(
      <VersionPicker
        versions={[v(), v({ public_id: "v-2", title: "Version 2" })]}
        currentPublicId="v-1"
      />
    )

    const trigger = screen.getByRole("combobox")
    fireEvent.keyDown(trigger, { key: "Enter" })
    const option = screen.getByRole("option", { name: "Version 2" })
    fireEvent.click(option)

    const target = replaceMock.mock.calls[0][0] as string
    expect(target).toContain("foo=bar")
    expect(target).toContain("v=v-2")
  })
})
