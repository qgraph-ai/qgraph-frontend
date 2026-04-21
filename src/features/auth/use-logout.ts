"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logout } from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation<void, NormalizedApiError, void>({
    mutationFn: () => {
      console.info("[auth-debug] useLogout.mutationFn: calling logout service")
      return logout()
    },
    onSuccess: () => {
      console.info("[auth-debug] useLogout.onSuccess")
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] useLogout.onError: status=${err.status} message='${err.message}'`
      )
    },
    onSettled: () => {
      console.info(
        "[auth-debug] useLogout.onSettled: clearing auth.me cache + removing queries"
      )
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, null)
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me, exact: false })
    },
  })
}
