import { apiClient } from "@/lib/api"

import { SEARCH_USE_MOCKS } from "./dev-flags"
import { SEARCH_PATHS } from "./paths"
import type { SearchBookmark, SearchBookmarkCreateInput } from "./types"

type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

const mockBookmarks: SearchBookmark[] = []
let nextMockBookmarkId = 1

export async function listSearchBookmarks(): Promise<SearchBookmark[]> {
  if (SEARCH_USE_MOCKS) {
    return [...mockBookmarks]
  }
  const res = await apiClient.get<Paginated<SearchBookmark> | SearchBookmark[]>(
    SEARCH_PATHS.bookmarks
  )
  return Array.isArray(res.data) ? res.data : res.data.results
}

export async function createSearchBookmark(
  input: SearchBookmarkCreateInput
): Promise<SearchBookmark> {
  if (SEARCH_USE_MOCKS) {
    const now = new Date().toISOString()
    const bookmark: SearchBookmark = {
      id: nextMockBookmarkId++,
      response: input.response_id ?? null,
      result_item: input.result_item_id ?? null,
      note: input.note ?? "",
      created_at: now,
      updated_at: now,
    }
    mockBookmarks.unshift(bookmark)
    return bookmark
  }
  const res = await apiClient.post<SearchBookmark>(SEARCH_PATHS.bookmarks, input)
  return res.data
}

export async function deleteSearchBookmark(id: number): Promise<void> {
  if (SEARCH_USE_MOCKS) {
    const index = mockBookmarks.findIndex((b) => b.id === id)
    if (index >= 0) mockBookmarks.splice(index, 1)
    return
  }
  await apiClient.delete(SEARCH_PATHS.bookmarkDetail(id))
}
