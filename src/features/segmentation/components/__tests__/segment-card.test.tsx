import { describe, expect, it } from "vitest"

import type { Ayah } from "@/services/quran"
import type { SegmentWithTags, Tag } from "@/services/segmentation"

import { SegmentCard } from "../segment-card"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

function tag(partial: Partial<Tag> = {}): Tag {
  return {
    id: 1,
    public_id: "tag-1",
    workspace: 1,
    name: "creation",
    color: "#22c55e",
    description: "",
    origin: "ai",
    ...partial,
  }
}

function ayah(n: number): Ayah {
  return {
    number_global: 2000 + n,
    surah_number: 2,
    number_in_surah: n,
    text_ar: `آية ${n}`,
  }
}

function segment(partial: Partial<SegmentWithTags> = {}): SegmentWithTags {
  return {
    id: 1,
    public_id: "seg-1",
    start_ayah: 1,
    end_ayah: 2,
    title: "",
    summary: "",
    origin: "ai",
    tags: [],
    ...partial,
  }
}

describe("SegmentCard", () => {
  it("renders ayahs in order", () => {
    renderWithProviders(
      <SegmentCard
        segment={segment({ tags: [tag()] })}
        ayahs={[ayah(1), ayah(2)]}
        ayahLabel={(a) => `ayah ${a.number_in_surah}`}
      />
    )
    expect(screen.getByText("آية 1", { exact: false })).toBeInTheDocument()
    expect(screen.getByText("آية 2", { exact: false })).toBeInTheDocument()
  })

  it("emits inline --seg-* CSS variables when the segment has a colored tag", () => {
    renderWithProviders(
      <SegmentCard
        segment={segment({ tags: [tag({ color: "#a855f7" })] })}
        ayahs={[ayah(1)]}
        ayahLabel={() => "ayah"}
      />
    )
    const card = document.querySelector("[data-segment-card]") as HTMLElement
    expect(card).not.toBeNull()
    expect(card.getAttribute("data-tinted")).toBe("")
    expect(card.style.getPropertyValue("--seg-tint-light")).toMatch(/oklch\(/)
    expect(card.style.getPropertyValue("--seg-tint-dark")).toMatch(/oklch\(/)
    expect(card.style.getPropertyValue("--seg-border-light")).toMatch(/oklch\(/)
    expect(card.style.getPropertyValue("--seg-border-dark")).toMatch(/oklch\(/)
  })

  it("omits inline color vars when no tag carries a color", () => {
    renderWithProviders(
      <SegmentCard
        segment={segment({ tags: [] })}
        ayahs={[ayah(1)]}
        ayahLabel={() => "ayah"}
      />
    )
    const card = document.querySelector("[data-segment-card]") as HTMLElement
    expect(card.getAttribute("data-tinted")).toBeNull()
    expect(card.style.getPropertyValue("--seg-tint-light")).toBe("")
  })

  it("renders a chip for each tag", () => {
    renderWithProviders(
      <SegmentCard
        segment={segment({
          tags: [
            tag({ public_id: "t-1", name: "creation" }),
            tag({ public_id: "t-2", name: "judgment", color: "#a855f7" }),
          ],
        })}
        ayahs={[ayah(1)]}
        ayahLabel={() => "ayah"}
      />
    )
    expect(screen.getByText("creation")).toBeInTheDocument()
    expect(screen.getByText("judgment")).toBeInTheDocument()
  })

  it("does not render a tag list when there are no tags", () => {
    renderWithProviders(
      <SegmentCard
        segment={segment({ tags: [] })}
        ayahs={[ayah(1)]}
        ayahLabel={() => "ayah"}
      />
    )
    const card = document.querySelector("[data-segment-card]") as HTMLElement
    expect(card.querySelector("ul")).toBeNull()
  })
})
