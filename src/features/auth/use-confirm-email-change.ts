"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import {
  confirmEmailChange,
  type ConfirmEmailChangePayload,
} from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useConfirmEmailChange() {
  const queryClient = useQueryClient()
  return useMutation<void, NormalizedApiError, ConfirmEmailChangePayload>({
    mutationFn: (vars) => {
      console.info(
        `[auth-debug] useConfirmEmailChange.mutationFn: uid='${vars.uid}' tokenLen=${vars.token?.length ?? 0} new_email='${vars.new_email}'`
      )
      return confirmEmailChange(vars)
    },
    onSuccess: () => {
      console.info(
        "[auth-debug] useConfirmEmailChange.onSuccess: invalidating auth.me"
      )
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me })
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] useConfirmEmailChange.onError: status=${err.status} message='${err.message}' details=${JSON.stringify(err.details)?.slice(0, 500)}`
      )
    },
  })
}
