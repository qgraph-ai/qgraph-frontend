"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { deleteCurrentUser } from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  return useMutation<void, NormalizedApiError, void>({
    mutationFn: () => {
      console.info("[auth-debug] useDeleteAccount.mutationFn: calling DELETE me")
      return deleteCurrentUser()
    },
    onSuccess: () => {
      console.info(
        "[auth-debug] useDeleteAccount.onSuccess: clearing auth.me cache"
      )
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, null)
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me, exact: false })
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] useDeleteAccount.onError: status=${err.status} message='${err.message}'`
      )
    },
  })
}
