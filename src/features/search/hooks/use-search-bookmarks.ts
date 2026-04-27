"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import { useAuth } from "@/features/auth/use-auth"
import {
  createSearchBookmark,
  deleteSearchBookmark,
  listSearchBookmarks,
  type SearchBookmark,
} from "@/services/search"

import { SEARCH_QUERY_KEYS } from "../query-keys"

export function useSearchBookmarks() {
  const { status } = useAuth()
  return useQuery<SearchBookmark[], NormalizedApiError>({
    queryKey: SEARCH_QUERY_KEYS.bookmarks,
    queryFn: listSearchBookmarks,
    enabled: status === "authenticated",
    staleTime: 60_000,
  })
}

type ToggleCallbacks = {
  onAdded?: () => void
  onRemoved?: () => void
  onError?: () => void
}

export function useToggleResponseBookmark(
  responseId: number | null,
  callbacks?: ToggleCallbacks
) {
  const queryClient = useQueryClient()
  const bookmarksQuery = useSearchBookmarks()
  const existing =
    responseId === null
      ? null
      : bookmarksQuery.data?.find((b) => b.response === responseId) ?? null

  const create = useMutation<
    SearchBookmark,
    NormalizedApiError,
    { responseId: number }
  >({
    mutationFn: ({ responseId }) =>
      createSearchBookmark({ response_id: responseId }),
    onSuccess: (bookmark) => {
      queryClient.setQueryData<SearchBookmark[]>(
        SEARCH_QUERY_KEYS.bookmarks,
        (prev) => [bookmark, ...(prev ?? [])]
      )
      callbacks?.onAdded?.()
    },
    onError: (err) => {
      logger.warn("Bookmark create failed", { status: err.status })
      callbacks?.onError?.()
    },
  })

  const remove = useMutation<void, NormalizedApiError, { id: number }>({
    mutationFn: ({ id }) => deleteSearchBookmark(id),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<SearchBookmark[]>(
        SEARCH_QUERY_KEYS.bookmarks,
        (prev) => (prev ?? []).filter((b) => b.id !== variables.id)
      )
      callbacks?.onRemoved?.()
    },
    onError: (err) => {
      logger.warn("Bookmark delete failed", { status: err.status })
      callbacks?.onError?.()
    },
  })

  return {
    isLoading: bookmarksQuery.isPending,
    isBookmarked: Boolean(existing),
    bookmark: existing,
    isMutating: create.isPending || remove.isPending,
    toggle: () => {
      if (responseId === null) return
      if (existing) {
        remove.mutate({ id: existing.id })
      } else {
        create.mutate({ responseId })
      }
    },
  }
}
