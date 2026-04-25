export type EditableSegment = {
  id: string
  startAyahNo: number
  endAyahNo: number
  title: string
  summary: string
  tagPublicIds: string[]
}

export function buildSegmentId(seed = "segment"): string {
  return `${seed}-${crypto.randomUUID()}`
}

export function createScratchSegments(totalAyahs: number): EditableSegment[] {
  if (!Number.isInteger(totalAyahs) || totalAyahs < 1) {
    return []
  }

  return [
    {
      id: buildSegmentId("scratch"),
      startAyahNo: 1,
      endAyahNo: totalAyahs,
      title: "",
      summary: "",
      tagPublicIds: [],
    },
  ]
}

export function splitSegment(
  segments: EditableSegment[],
  segmentIndex: number,
  splitAfterAyahNo: number
): EditableSegment[] {
  const target = segments[segmentIndex]
  if (!target) return segments

  if (splitAfterAyahNo < target.startAyahNo) return segments
  if (splitAfterAyahNo >= target.endAyahNo) return segments

  const left: EditableSegment = {
    ...target,
    id: buildSegmentId("split"),
    endAyahNo: splitAfterAyahNo,
  }

  const right: EditableSegment = {
    ...target,
    id: buildSegmentId("split"),
    startAyahNo: splitAfterAyahNo + 1,
  }

  return [
    ...segments.slice(0, segmentIndex),
    left,
    right,
    ...segments.slice(segmentIndex + 1),
  ]
}

export function mergeAdjacentSegments(
  segments: EditableSegment[],
  leftIndex: number
): EditableSegment[] {
  const left = segments[leftIndex]
  const right = segments[leftIndex + 1]

  if (!left || !right) return segments

  const merged: EditableSegment = {
    ...left,
    id: buildSegmentId("merge"),
    endAyahNo: right.endAyahNo,
    title: left.title || right.title,
    summary: left.summary || right.summary,
    tagPublicIds: [...new Set([...left.tagPublicIds, ...right.tagPublicIds])],
  }

  return [
    ...segments.slice(0, leftIndex),
    merged,
    ...segments.slice(leftIndex + 2),
  ]
}

export function shiftBoundary(
  segments: EditableSegment[],
  leftIndex: number,
  delta: number
): EditableSegment[] {
  if (!delta) return segments

  const left = segments[leftIndex]
  const right = segments[leftIndex + 1]

  if (!left || !right) return segments

  const boundary = left.endAyahNo + delta
  const minBoundary = left.startAyahNo
  const maxBoundary = right.endAyahNo - 1

  if (boundary < minBoundary || boundary > maxBoundary) {
    return segments
  }

  const next = [...segments]
  next[leftIndex] = {
    ...left,
    endAyahNo: boundary,
  }
  next[leftIndex + 1] = {
    ...right,
    startAyahNo: boundary + 1,
  }

  return next
}

export function updateSegmentText(
  segments: EditableSegment[],
  index: number,
  patch: Pick<EditableSegment, "title" | "summary">
): EditableSegment[] {
  const row = segments[index]
  if (!row) return segments
  const next = [...segments]
  next[index] = { ...row, ...patch }
  return next
}

export function toggleSegmentTag(
  segments: EditableSegment[],
  index: number,
  tagPublicId: string
): EditableSegment[] {
  const row = segments[index]
  if (!row) return segments

  const hasTag = row.tagPublicIds.includes(tagPublicId)
  const tagPublicIds = hasTag
    ? row.tagPublicIds.filter((id) => id !== tagPublicId)
    : [...row.tagPublicIds, tagPublicId]

  const next = [...segments]
  next[index] = {
    ...row,
    tagPublicIds,
  }
  return next
}

export function isValidCover(
  segments: EditableSegment[],
  totalAyahs: number
): boolean {
  if (segments.length < 1 || totalAyahs < 1) return false

  let expectedStart = 1

  for (const segment of segments) {
    if (segment.startAyahNo !== expectedStart) return false
    if (segment.endAyahNo < segment.startAyahNo) return false
    expectedStart = segment.endAyahNo + 1
  }

  return segments[segments.length - 1]?.endAyahNo === totalAyahs
}
