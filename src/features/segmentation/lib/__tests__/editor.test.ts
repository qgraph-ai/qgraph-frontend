import { describe, expect, it, vi } from "vitest"

import {
  createScratchSegments,
  isValidCover,
  mergeAdjacentSegments,
  shiftBoundary,
  splitSegment,
  toggleSegmentTag,
  updateSegmentText,
  type EditableSegment,
} from "@/features/segmentation/lib/editor"

vi.stubGlobal("crypto", {
  randomUUID: () => "fixed-id",
})

const SEGMENTS: EditableSegment[] = [
  {
    id: "a",
    startAyahNo: 1,
    endAyahNo: 5,
    title: "A",
    summary: "A summary",
    tagPublicIds: ["tag-a"],
  },
  {
    id: "b",
    startAyahNo: 6,
    endAyahNo: 10,
    title: "B",
    summary: "B summary",
    tagPublicIds: ["tag-b"],
  },
]

describe("segmentation editor engine", () => {
  it("creates one full-range segment for scratch mode", () => {
    const rows = createScratchSegments(7)

    expect(rows).toEqual([
      {
        id: "scratch-fixed-id",
        startAyahNo: 1,
        endAyahNo: 7,
        title: "",
        summary: "",
        tagPublicIds: [],
      },
    ])
  })

  it("splits a segment at a valid boundary", () => {
    const rows = splitSegment(SEGMENTS, 0, 3)

    expect(rows).toHaveLength(3)
    expect(rows[0].startAyahNo).toBe(1)
    expect(rows[0].endAyahNo).toBe(3)
    expect(rows[1].startAyahNo).toBe(4)
    expect(rows[1].endAyahNo).toBe(5)
  })

  it("ignores invalid split boundaries", () => {
    expect(splitSegment(SEGMENTS, 0, 0)).toBe(SEGMENTS)
    expect(splitSegment(SEGMENTS, 0, 5)).toBe(SEGMENTS)
  })

  it("merges adjacent segments and unions tags", () => {
    const rows = mergeAdjacentSegments(
      [
        {
          ...SEGMENTS[0],
          title: "",
          summary: "",
          tagPublicIds: ["tag-a"],
        },
        {
          ...SEGMENTS[1],
          tagPublicIds: ["tag-a", "tag-b"],
        },
      ],
      0
    )

    expect(rows).toHaveLength(1)
    expect(rows[0].startAyahNo).toBe(1)
    expect(rows[0].endAyahNo).toBe(10)
    expect(rows[0].title).toBe("B")
    expect(rows[0].summary).toBe("B summary")
    expect(rows[0].tagPublicIds).toEqual(["tag-a", "tag-b"])
  })

  it("shifts boundary with minimum-length guarantees", () => {
    const shiftedForward = shiftBoundary(SEGMENTS, 0, 2)
    expect(shiftedForward[0].endAyahNo).toBe(7)
    expect(shiftedForward[1].startAyahNo).toBe(8)

    const shiftedBackward = shiftBoundary(SEGMENTS, 0, -2)
    expect(shiftedBackward[0].endAyahNo).toBe(3)
    expect(shiftedBackward[1].startAyahNo).toBe(4)

    const invalidForward = shiftBoundary(SEGMENTS, 0, 5)
    expect(invalidForward).toBe(SEGMENTS)

    const invalidBackward = shiftBoundary(SEGMENTS, 0, -5)
    expect(invalidBackward).toBe(SEGMENTS)
  })

  it("updates text fields and toggles tag assignment", () => {
    const updated = updateSegmentText(SEGMENTS, 1, {
      title: "New",
      summary: "Updated",
    })
    expect(updated[1].title).toBe("New")
    expect(updated[1].summary).toBe("Updated")

    const withNewTag = toggleSegmentTag(SEGMENTS, 0, "tag-c")
    expect(withNewTag[0].tagPublicIds).toEqual(["tag-a", "tag-c"])

    const withoutTag = toggleSegmentTag(withNewTag, 0, "tag-a")
    expect(withoutTag[0].tagPublicIds).toEqual(["tag-c"])
  })

  it("validates contiguous full-surah coverage", () => {
    expect(isValidCover(SEGMENTS, 10)).toBe(true)
    expect(
      isValidCover(
        [
          { ...SEGMENTS[0], endAyahNo: 4 },
          { ...SEGMENTS[1], startAyahNo: 6 },
        ],
        10
      )
    ).toBe(false)
    expect(isValidCover([], 10)).toBe(false)
  })
})
