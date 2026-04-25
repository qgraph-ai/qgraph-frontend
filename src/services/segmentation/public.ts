import { apiClient } from "@/lib/api"

import { SEGMENTATION_PATHS } from "./paths"
import type {
  ListPublicVersionsParams,
  PaginatedResponse,
  SegmentDTO,
  SegmentationVersionDTO,
  TagDTO,
  WorkspaceDTO,
} from "./types"

const MAX_PAGE_SIZE = 200

async function listAllPages<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {}
): Promise<T[]> {
  const rows: T[] = []
  let page = 1

  while (true) {
    const response = await apiClient.get<PaginatedResponse<T>>(path, {
      params: {
        ...params,
        page,
        page_size: MAX_PAGE_SIZE,
      },
    })

    rows.push(...response.data.results)

    if (!response.data.next) {
      return rows
    }

    page += 1
  }
}

export async function getFeaturedPublicWorkspace(): Promise<WorkspaceDTO> {
  const response = await apiClient.get<WorkspaceDTO>(
    SEGMENTATION_PATHS.publicFeaturedWorkspace
  )
  return response.data
}

export async function listPublicWorkspaces(): Promise<WorkspaceDTO[]> {
  return listAllPages<WorkspaceDTO>(SEGMENTATION_PATHS.publicWorkspaces)
}

export async function listPublicSegmentationVersions({
  slug,
  surah,
  status,
}: ListPublicVersionsParams): Promise<SegmentationVersionDTO[]> {
  return listAllPages<SegmentationVersionDTO>(
    SEGMENTATION_PATHS.publicWorkspaceSegmentationVersions(slug),
    {
      surah,
      status,
    }
  )
}

export async function listPublicSegmentationVersionSegments(
  publicId: string
): Promise<SegmentDTO[]> {
  return listAllPages<SegmentDTO>(
    SEGMENTATION_PATHS.publicSegmentationVersionSegments(publicId)
  )
}

export async function listPublicSegmentationVersionTags(
  publicId: string
): Promise<TagDTO[]> {
  return listAllPages<TagDTO>(
    SEGMENTATION_PATHS.publicSegmentationVersionTags(publicId)
  )
}
