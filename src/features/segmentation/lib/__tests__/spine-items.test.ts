import { describe, expect, it } from "vitest"

import type { Ayah } from "@/services/quran"
import type { SegmentWithTags, Tag } from "@/services/segmentation"

import type { SegmentBlock } from "../group-segments"
import { buildSpineItems } from "../spine-items"

function ayah(inSurah: number, text = "آية"): Ayah {
  return {
    number_global: 669 + inSurah,
    surah_number: 5,
    number_in_surah: inSurah,
    text_ar: text,
  }
}

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

function segment(
  publicId: string,
  partial: Partial<SegmentWithTags> = {}
): SegmentWithTags {
  return {
    id: 1,
    public_id: publicId,
    start_ayah: 670,
    end_ayah: 671,
    title: "",
    summary: "",
    origin: "ai",
    tags: [],
    ...partial,
  }
}

function segmentBlock(
  publicId: string,
  ayahs: Ayah[],
  segmentPartial: Partial<SegmentWithTags> = {}
): SegmentBlock {
  return {
    kind: "segment",
    segment: segment(publicId, segmentPartial),
    ayahs,
  }
}

function gapBlock(ayahs: Ayah[]): SegmentBlock {
  return { kind: "gap", ayahs }
}

describe("buildSpineItems", () => {
  it("returns empty result for empty blocks", () => {
    const result = buildSpineItems([])
    expect(result.items).toEqual([])
    expect(result.totalChars).toBe(0)
  })

  it("computes proportional character counts and total", () => {
    const result = buildSpineItems([
      segmentBlock("a", [ayah(1, "ABC"), ayah(2, "DE")]), // 5 chars
      segmentBlock("b", [ayah(3, "X")]), // 1 char
    ])
    expect(result.totalChars).toBe(6)
    expect(result.items).toHaveLength(2)
    expect(result.items[0].chars).toBe(5)
    expect(result.items[1].chars).toBe(1)
  })

  it("emits stable targetIds matching the segment / gap DOM ids", () => {
    const result = buildSpineItems([
      segmentBlock("seg-a", [ayah(1)]),
      gapBlock([ayah(2)]),
    ])
    expect(result.items[0].targetId).toBe("segment-seg-a")
    expect(result.items[1].targetId).toBe("gap-671")
  })

  it("indexes segments sequentially (ignoring gaps)", () => {
    const result = buildSpineItems([
      segmentBlock("a", [ayah(1)]),
      gapBlock([ayah(2)]),
      segmentBlock("b", [ayah(3)]),
    ])
    const segs = result.items.filter((i) => i.kind === "segment")
    expect(segs.map((s) => (s.kind === "segment" ? s.index : 0))).toEqual([1, 2])
  })

  it("uses the first colored tag as the segment color", () => {
    const result = buildSpineItems([
      segmentBlock("a", [ayah(1)], {
        tags: [tag({ color: "#a855f7", name: "judgment" })],
      }),
    ])
    expect(result.items[0]).toMatchObject({ kind: "segment", color: "#a855f7" })
  })

  it("yields color = null when the segment has no colored tag", () => {
    const result = buildSpineItems([
      segmentBlock("a", [ayah(1)], { tags: [] }),
    ])
    expect(result.items[0]).toMatchObject({ kind: "segment", color: null })
  })

  it("captures surah-local ayah ranges for each item", () => {
    const result = buildSpineItems([
      segmentBlock("a", [ayah(1), ayah(2), ayah(3)]),
      gapBlock([ayah(4)]),
    ])
    expect(result.items[0]).toMatchObject({ rangeStart: 1, rangeEnd: 3 })
    expect(result.items[1]).toMatchObject({ rangeStart: 4, rangeEnd: 4 })
  })

  it("skips blocks with no ayahs defensively", () => {
    const result = buildSpineItems([gapBlock([])])
    expect(result.items).toEqual([])
  })
})
