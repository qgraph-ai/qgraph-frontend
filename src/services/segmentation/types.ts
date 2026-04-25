export type Origin = "ai" | "user"
export type WorkspaceVisibility = "private" | "public" | "unlisted"
export type SegmentationStatus = "draft" | "active" | "archived"

export type PaginatedResponse<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type WorkspaceDTO = {
  id: number
  slug: string
  title: string
  description: string
  visibility: WorkspaceVisibility
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type SegmentationVersionDTO = {
  id: number
  public_id: string
  workspace: number
  surah: number
  title: string
  status: SegmentationStatus
  origin: Origin
  base_version: number | null
  created_at: string
  updated_at: string
}

export type TagDTO = {
  id: number
  public_id: string
  workspace: number
  name: string
  color: string
  description: string
  origin: Origin
}

export type SegmentDTO = {
  id: number
  public_id: string
  start_ayah: number
  end_ayah: number
  title: string
  summary: string
  origin: Origin
  tags: TagDTO[]
}

export type SegmentationStatusFilter = SegmentationStatus | "default"

export type ListPublicVersionsParams = {
  slug: string
  surah?: number
  status?: SegmentationStatus
}

export type ListOwnerWorkspaceVersionsParams = {
  slug: string
  surah?: number
}

export type CreateWorkspacePayload = {
  title: string
  description?: string
}

export type CreateWorkspaceVersionPayload = {
  surah?: number | null
  title?: string
  base_version_public_id?: string | null
}

export type CreateWorkspaceTagPayload = {
  name: string
  color?: string
  description?: string
}

export type SnapshotSegmentPayload = {
  start_ayah: number
  end_ayah: number
  title?: string
  summary?: string
  tags?: string[]
}

export type SaveSnapshotPayload = {
  title?: string
  segments: SnapshotSegmentPayload[]
}
