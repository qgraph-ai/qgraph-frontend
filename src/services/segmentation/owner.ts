import { apiClient } from "@/lib/api"

import { SEGMENTATION_PATHS } from "./paths"
import type {
  CreateWorkspacePayload,
  CreateWorkspaceTagPayload,
  CreateWorkspaceVersionPayload,
  ListOwnerWorkspaceVersionsParams,
  PaginatedResponse,
  SaveSnapshotPayload,
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

export async function listOwnerWorkspaces(): Promise<WorkspaceDTO[]> {
  return listAllPages<WorkspaceDTO>(SEGMENTATION_PATHS.workspaces)
}

export async function createOwnerWorkspace(
  payload: CreateWorkspacePayload
): Promise<WorkspaceDTO> {
  const response = await apiClient.post<WorkspaceDTO>(
    SEGMENTATION_PATHS.workspaces,
    payload
  )
  return response.data
}

export async function listOwnerWorkspaceSegmentationVersions({
  slug,
  surah,
}: ListOwnerWorkspaceVersionsParams): Promise<SegmentationVersionDTO[]> {
  return listAllPages<SegmentationVersionDTO>(
    SEGMENTATION_PATHS.workspaceSegmentationVersions(slug),
    { surah }
  )
}

export async function createOwnerWorkspaceSegmentationVersion(
  slug: string,
  payload: CreateWorkspaceVersionPayload
): Promise<SegmentationVersionDTO> {
  const response = await apiClient.post<SegmentationVersionDTO>(
    SEGMENTATION_PATHS.workspaceSegmentationVersions(slug),
    payload
  )
  return response.data
}

export async function listOwnerSegmentationVersionSegments(
  publicId: string
): Promise<SegmentDTO[]> {
  return listAllPages<SegmentDTO>(
    SEGMENTATION_PATHS.segmentationVersionSegments(publicId)
  )
}

export async function saveOwnerSegmentationVersionSnapshot(
  publicId: string,
  payload: SaveSnapshotPayload
): Promise<SegmentationVersionDTO> {
  const response = await apiClient.post<SegmentationVersionDTO>(
    SEGMENTATION_PATHS.segmentationVersionSaveSnapshot(publicId),
    payload
  )
  return response.data
}

export async function activateOwnerSegmentationVersion(
  publicId: string
): Promise<SegmentationVersionDTO> {
  const response = await apiClient.post<SegmentationVersionDTO>(
    SEGMENTATION_PATHS.segmentationVersionActivate(publicId)
  )
  return response.data
}

export async function listOwnerWorkspaceTags(slug: string): Promise<TagDTO[]> {
  return listAllPages<TagDTO>(SEGMENTATION_PATHS.workspaceTags(slug))
}

export async function createOwnerWorkspaceTag(
  slug: string,
  payload: CreateWorkspaceTagPayload
): Promise<TagDTO> {
  const response = await apiClient.post<TagDTO>(
    SEGMENTATION_PATHS.workspaceTags(slug),
    payload
  )
  return response.data
}
