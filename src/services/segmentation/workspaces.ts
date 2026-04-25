import { cache } from "react"

import { apiClient } from "@/lib/api"

import { SEGMENTATION_PATHS } from "./paths"
import type {
  ListSegmentationVersionsParams,
  Paginated,
  SegmentationVersion,
  Workspace,
} from "./types"

export const getFeaturedWorkspace = cache(async (): Promise<Workspace> => {
  const res = await apiClient.get<Workspace>(SEGMENTATION_PATHS.featuredWorkspace)
  return res.data
})

export const listSegmentationVersions = cache(
  async (
    slug: string,
    params: ListSegmentationVersionsParams = {}
  ): Promise<Paginated<SegmentationVersion>> => {
    const res = await apiClient.get<Paginated<SegmentationVersion>>(
      SEGMENTATION_PATHS.workspaceVersions(slug),
      { params }
    )
    return res.data
  }
)
