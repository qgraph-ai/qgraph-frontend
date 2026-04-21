"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { setPassword, type SetPasswordPayload } from "@/services/auth"

export function useSetPassword() {
  return useMutation<void, NormalizedApiError, SetPasswordPayload>({
    mutationFn: (vars) => {
      console.info(
        "[auth-debug] useSetPassword.mutationFn: submitting (passwords redacted)"
      )
      return setPassword(vars)
    },
    onSuccess: () => {
      console.info("[auth-debug] useSetPassword.onSuccess")
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] useSetPassword.onError: status=${err.status} message='${err.message}' details=${JSON.stringify(err.details)?.slice(0, 500)}`
      )
    },
  })
}
