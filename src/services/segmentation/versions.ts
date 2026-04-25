import { cache } from "react"

import { apiClient } from "@/lib/api"

import { SEGMENTATION_PATHS } from "./paths"
import type {
  ListSegmentsParams,
  ListVersionTagsParams,
  Paginated,
  SegmentWithTags,
  Tag,
} from "./types"

export const listSegments = cache(
  async (
    publicId: string,
    params: ListSegmentsParams = {}
  ): Promise<Paginated<SegmentWithTags>> => {
    const res = await apiClient.get<Paginated<SegmentWithTags>>(
      SEGMENTATION_PATHS.versionSegments(publicId),
      { params }
    )
    return res.data
  }
)

export const getAllSegments = cache(
  async (publicId: string): Promise<SegmentWithTags[]> => {
    const segments: SegmentWithTags[] = []
    let page = 1
    while (true) {
      const res = await listSegments(publicId, {
        page,
        page_size: 200,
        ordering: "start_ayah",
      })
      segments.push(...res.results)
      if (!res.next) break
      page += 1
    }
    return segments
  }
)

export const listVersionTags = cache(
  async (
    publicId: string,
    params: ListVersionTagsParams = {}
  ): Promise<Paginated<Tag>> => {
    const res = await apiClient.get<Paginated<Tag>>(
      SEGMENTATION_PATHS.versionTags(publicId),
      { params }
    )
    return res.data
  }
)
