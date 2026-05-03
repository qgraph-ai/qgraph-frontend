import { apiClient } from "@/lib/api"

import { SEARCH_PATHS } from "./paths"
import type { SearchBookmark, SearchBookmarkCreateInput } from "./types"

type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export async function listSearchBookmarks(): Promise<SearchBookmark[]> {
  const res = await apiClient.get<Paginated<SearchBookmark> | SearchBookmark[]>(
    SEARCH_PATHS.bookmarks
  )
  return Array.isArray(res.data) ? res.data : res.data.results
}

export async function createSearchBookmark(
  input: SearchBookmarkCreateInput
): Promise<SearchBookmark> {
  const res = await apiClient.post<SearchBookmark>(SEARCH_PATHS.bookmarks, input)
  return res.data
}

export async function deleteSearchBookmark(id: number): Promise<void> {
  await apiClient.delete(SEARCH_PATHS.bookmarkDetail(id))
}
