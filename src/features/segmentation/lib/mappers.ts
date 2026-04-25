import type { Ayah } from "@/services/quran"
import type {
  SaveSnapshotPayload,
  SegmentDTO,
  SnapshotSegmentPayload,
} from "@/services/segmentation"

import type { EditableSegment } from "./editor"

export type AyahIndexMaps = {
  ayahByNumberInSurah: Map<number, Ayah>
  ayahByIdentifier: Map<number, Ayah>
}

export type HydratedSegmentsResult =
  | {
      ok: true
      segments: EditableSegment[]
    }
  | {
      ok: false
      reason: string
    }

export function buildAyahIndexMaps(ayahs: Ayah[]): AyahIndexMaps {
  const ayahByNumberInSurah = new Map<number, Ayah>()
  const ayahByIdentifier = new Map<number, Ayah>()

  for (const ayah of ayahs) {
    ayahByNumberInSurah.set(ayah.number_in_surah, ayah)
    ayahByIdentifier.set(ayah.number_global, ayah)
  }

  return {
    ayahByNumberInSurah,
    ayahByIdentifier,
  }
}

export function hydrateEditableSegments(
  segments: SegmentDTO[],
  ayahByIdentifier: Map<number, Ayah>
): HydratedSegmentsResult {
  const rows: EditableSegment[] = []

  for (const segment of segments) {
    const startAyah = ayahByIdentifier.get(segment.start_ayah)
    const endAyah = ayahByIdentifier.get(segment.end_ayah)

    if (!startAyah || !endAyah) {
      return {
        ok: false,
        reason: "ayah_identifier_mismatch",
      }
    }

    rows.push({
      id: segment.public_id,
      startAyahNo: startAyah.number_in_surah,
      endAyahNo: endAyah.number_in_surah,
      title: segment.title ?? "",
      summary: segment.summary ?? "",
      tagPublicIds: [...new Set(segment.tags.map((tag) => tag.public_id))],
    })
  }

  rows.sort((a, b) => a.startAyahNo - b.startAyahNo)

  return {
    ok: true,
    segments: rows,
  }
}

export function mapEditorSegmentsToSnapshot(
  segments: EditableSegment[],
  ayahByNumberInSurah: Map<number, Ayah>
): SnapshotSegmentPayload[] {
  return segments.map((segment) => {
    const start = ayahByNumberInSurah.get(segment.startAyahNo)
    const end = ayahByNumberInSurah.get(segment.endAyahNo)

    if (!start || !end) {
      throw new Error("Unable to map segment ayah range to API identifiers")
    }

    return {
      start_ayah: start.number_global,
      end_ayah: end.number_global,
      title: segment.title,
      summary: segment.summary,
      tags: segment.tagPublicIds,
    }
  })
}

export function buildSaveSnapshotPayload(
  title: string,
  segments: EditableSegment[],
  ayahByNumberInSurah: Map<number, Ayah>
): SaveSnapshotPayload {
  return {
    title,
    segments: mapEditorSegmentsToSnapshot(segments, ayahByNumberInSurah),
  }
}
