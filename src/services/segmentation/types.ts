export type WorkspaceVisibility = "private" | "public" | "unlisted"
export type SegmentationStatus = "draft" | "active" | "archived"
export type SegmentationOrigin = "ai" | "user"

export type Workspace = {
  id: number
  slug: string
  title: string
  description: string
  visibility: WorkspaceVisibility
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type SegmentationVersion = {
  id: number
  public_id: string
  workspace: number
  surah: number
  title: string
  status: SegmentationStatus
  origin: SegmentationOrigin
  base_version: number | null
  created_at: string
  updated_at: string
}

export type Tag = {
  id: number
  public_id: string
  workspace: number
  name: string
  color: string
  description: string
  origin: SegmentationOrigin
  created_at?: string
  updated_at?: string
}

export type SegmentWithTags = {
  id: number
  public_id: string
  start_ayah: number
  end_ayah: number
  title: string
  summary: string
  origin: SegmentationOrigin
  tags: Tag[]
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type ListSegmentationVersionsParams = {
  surah?: number
  status?: SegmentationStatus
  ordering?: string
  search?: string
  page?: number
  page_size?: number
}

export type ListSegmentsParams = {
  ordering?: string
  search?: string
  page?: number
  page_size?: number
}

export type ListVersionTagsParams = {
  ordering?: string
  search?: string
  page?: number
  page_size?: number
}
