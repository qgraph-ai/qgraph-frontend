"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import {
  confirmPasswordReset,
  type ResetPasswordConfirmPayload,
} from "@/services/auth"

export function usePasswordResetConfirm() {
  return useMutation<void, NormalizedApiError, ResetPasswordConfirmPayload>({
    mutationFn: (vars) => {
      console.info(
        `[auth-debug] usePasswordResetConfirm.mutationFn: uid='${vars.uid}' tokenLen=${vars.token?.length ?? 0} (new_password redacted)`
      )
      return confirmPasswordReset(vars)
    },
    onSuccess: () => {
      console.info("[auth-debug] usePasswordResetConfirm.onSuccess")
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] usePasswordResetConfirm.onError: status=${err.status} message='${err.message}' details=${JSON.stringify(err.details)?.slice(0, 500)}`
      )
    },
  })
}
