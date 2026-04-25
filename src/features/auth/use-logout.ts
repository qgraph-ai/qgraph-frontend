"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import { logout } from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation<void, NormalizedApiError, void>({
    mutationFn: logout,
    onError: (err) => {
      logger.warn("Sign-out request failed", {
        status: err.status,
        code: err.code,
      })
    },
    onSettled: () => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, null)
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me, exact: false })
    },
  })
}
