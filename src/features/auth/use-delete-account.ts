"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import { deleteCurrentUser } from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation<void, NormalizedApiError, void>({
    mutationFn: deleteCurrentUser,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, null)
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me, exact: false })
    },
    onError: (err) => {
      logger.error("Delete account request failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
