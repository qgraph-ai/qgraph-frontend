import { describe, expect, it } from "vitest"

import {
  buildAyahIndexMaps,
  buildSaveSnapshotPayload,
  hydrateEditableSegments,
} from "@/features/segmentation/lib/mappers"

const ayahs = [
  {
    number_global: 2001,
    surah_number: 2,
    number_in_surah: 1,
    text_ar: "a",
    translation: "",
  },
  {
    number_global: 2002,
    surah_number: 2,
    number_in_surah: 2,
    text_ar: "b",
    translation: "",
  },
  {
    number_global: 2003,
    surah_number: 2,
    number_in_surah: 3,
    text_ar: "c",
    translation: "",
  },
]

describe("segmentation mappers", () => {
  it("hydrates editable segments from API identifiers", () => {
    const maps = buildAyahIndexMaps(ayahs)
    const result = hydrateEditableSegments(
      [
        {
          id: 1,
          public_id: "segment-1",
          start_ayah: 2001,
          end_ayah: 2002,
          title: "First",
          summary: "S",
          origin: "ai",
          tags: [
            {
              id: 9,
              public_id: "tag-1",
              workspace: 1,
              name: "Tag",
              color: "#00aa00",
              description: "",
              origin: "ai",
            },
          ],
        },
      ],
      maps.ayahByIdentifier
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.segments).toEqual([
      {
        id: "segment-1",
        startAyahNo: 1,
        endAyahNo: 2,
        title: "First",
        summary: "S",
        tagPublicIds: ["tag-1"],
      },
    ])
  })

  it("fails fast on identifier mismatch", () => {
    const maps = buildAyahIndexMaps(ayahs)
    const result = hydrateEditableSegments(
      [
        {
          id: 1,
          public_id: "segment-1",
          start_ayah: 9999,
          end_ayah: 2002,
          title: "First",
          summary: "S",
          origin: "ai",
          tags: [],
        },
      ],
      maps.ayahByIdentifier
    )

    expect(result).toEqual({
      ok: false,
      reason: "ayah_identifier_mismatch",
    })
  })

  it("maps editor segments to save-snapshot payload", () => {
    const maps = buildAyahIndexMaps(ayahs)

    const payload = buildSaveSnapshotPayload(
      "Version title",
      [
        {
          id: "s-1",
          startAyahNo: 1,
          endAyahNo: 3,
          title: "Block",
          summary: "Summary",
          tagPublicIds: ["tag-1", "tag-2"],
        },
      ],
      maps.ayahByNumberInSurah
    )

    expect(payload).toEqual({
      title: "Version title",
      segments: [
        {
          start_ayah: 2001,
          end_ayah: 2003,
          title: "Block",
          summary: "Summary",
          tags: ["tag-1", "tag-2"],
        },
      ],
    })
  })

  it("throws for unknown ayah numbers during save mapping", () => {
    const maps = buildAyahIndexMaps(ayahs)

    expect(() =>
      buildSaveSnapshotPayload(
        "X",
        [
          {
            id: "s-1",
            startAyahNo: 1,
            endAyahNo: 999,
            title: "",
            summary: "",
            tagPublicIds: [],
          },
        ],
        maps.ayahByNumberInSurah
      )
    ).toThrow("Unable to map segment ayah range to API identifiers")
  })
})
