import { describe, expect, it } from "vitest"

import type { Ayah } from "@/services/quran"
import type { SegmentWithTags } from "@/services/segmentation"

import { groupSegments } from "../group-segments"

/**
 * Tests use surah 5 (Al-Mā'idah). In the backend's global ayah numbering,
 * surah 5 starts at ayah 670, so segment.start_ayah / end_ayah live in
 * that absolute range. The in-surah numbering shown to readers is offset
 * by 669.
 */
const GLOBAL_OFFSET = 669

function ayah(inSurah: number): Ayah {
  return {
    number_global: GLOBAL_OFFSET + inSurah,
    surah_number: 5,
    number_in_surah: inSurah,
    text_ar: `آية ${inSurah}`,
  }
}

function segment(
  id: number,
  startInSurah: number,
  endInSurah: number,
  partial: Partial<SegmentWithTags> = {}
): SegmentWithTags {
  return {
    id,
    public_id: `seg-${id}`,
    start_ayah: GLOBAL_OFFSET + startInSurah,
    end_ayah: GLOBAL_OFFSET + endInSurah,
    title: "",
    summary: "",
    origin: "ai",
    tags: [],
    ...partial,
  }
}

describe("groupSegments", () => {
  it("returns an empty list when ayahs are empty", () => {
    expect(groupSegments([], [segment(1, 1, 5)])).toEqual([])
  })

  it("emits a single gap when no segments cover the surah", () => {
    const ayahs = [ayah(1), ayah(2), ayah(3)]
    const blocks = groupSegments(ayahs, [])
    expect(blocks).toHaveLength(1)
    expect(blocks[0].kind).toBe("gap")
    expect(blocks[0].ayahs.map((a) => a.number_in_surah)).toEqual([1, 2, 3])
  })

  it("emits one segment block when segments fully cover", () => {
    const ayahs = [ayah(1), ayah(2), ayah(3)]
    const blocks = groupSegments(ayahs, [segment(1, 1, 3)])
    expect(blocks).toHaveLength(1)
    expect(blocks[0].kind).toBe("segment")
    expect(blocks[0].ayahs.map((a) => a.number_in_surah)).toEqual([1, 2, 3])
  })

  it("matches segments using GLOBAL ayah numbers, not in-surah", () => {
    const ayahs = [ayah(1), ayah(2), ayah(3)]
    // Segment carries the global 670..672; helper must match against
    // ayah.number_global, not number_in_surah (which is 1..3).
    const blocks = groupSegments(ayahs, [segment(1, 1, 3)])
    expect(blocks[0].kind).toBe("segment")
    expect(blocks[0].ayahs.map((a) => a.number_global)).toEqual([670, 671, 672])
  })

  it("emits contiguous segments in order", () => {
    const ayahs = [1, 2, 3, 4, 5].map(ayah)
    const blocks = groupSegments(ayahs, [
      segment(1, 1, 2),
      segment(2, 3, 5),
    ])
    expect(blocks.map((b) => b.kind)).toEqual(["segment", "segment"])
    expect(blocks[0].ayahs.map((a) => a.number_in_surah)).toEqual([1, 2])
    expect(blocks[1].ayahs.map((a) => a.number_in_surah)).toEqual([3, 4, 5])
  })

  it("inserts gap blocks for uncovered ayahs", () => {
    const ayahs = [1, 2, 3, 4, 5, 6].map(ayah)
    const blocks = groupSegments(ayahs, [
      segment(1, 2, 3),
      segment(2, 5, 5),
    ])
    expect(blocks.map((b) => b.kind)).toEqual([
      "gap",
      "segment",
      "gap",
      "segment",
      "gap",
    ])
    expect(blocks[0].ayahs.map((a) => a.number_in_surah)).toEqual([1])
    expect(blocks[1].ayahs.map((a) => a.number_in_surah)).toEqual([2, 3])
    expect(blocks[2].ayahs.map((a) => a.number_in_surah)).toEqual([4])
    expect(blocks[3].ayahs.map((a) => a.number_in_surah)).toEqual([5])
    expect(blocks[4].ayahs.map((a) => a.number_in_surah)).toEqual([6])
  })

  it("sorts segments by start_ayah", () => {
    const ayahs = [1, 2, 3, 4].map(ayah)
    const blocks = groupSegments(ayahs, [
      segment(1, 3, 4),
      segment(2, 1, 2),
    ])
    expect(blocks.map((b) => b.kind)).toEqual(["segment", "segment"])
    expect(blocks[0].ayahs.map((a) => a.number_in_surah)).toEqual([1, 2])
    expect(blocks[1].ayahs.map((a) => a.number_in_surah)).toEqual([3, 4])
  })

  it("clamps segments that extend beyond the surah's ayah range", () => {
    const ayahs = [1, 2, 3].map(ayah)
    // Segment 0..10 (in-surah) maps to 669..679 globally; only 670..672
    // exist in the input, so the helper clamps and emits a single segment.
    const blocks = groupSegments(ayahs, [segment(1, 0, 10)])
    expect(blocks).toHaveLength(1)
    expect(blocks[0].kind).toBe("segment")
    expect(blocks[0].ayahs.map((a) => a.number_in_surah)).toEqual([1, 2, 3])
  })

  it("skips overlapping segments defensively (later segment ignored)", () => {
    const ayahs = [1, 2, 3, 4].map(ayah)
    const blocks = groupSegments(ayahs, [
      segment(1, 1, 3),
      segment(2, 2, 4),
    ])
    expect(blocks.map((b) => b.kind)).toEqual(["segment", "gap"])
    expect(blocks[0].ayahs.map((a) => a.number_in_surah)).toEqual([1, 2, 3])
    expect(blocks[1].ayahs.map((a) => a.number_in_surah)).toEqual([4])
  })

  it("ignores segments fully outside the ayah range", () => {
    const ayahs = [1, 2, 3].map(ayah)
    const blocks = groupSegments(ayahs, [segment(1, 10, 12)])
    expect(blocks).toHaveLength(1)
    expect(blocks[0].kind).toBe("gap")
  })
})
