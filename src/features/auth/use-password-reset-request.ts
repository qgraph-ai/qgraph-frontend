"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import {
  requestPasswordReset,
  type ResetPasswordPayload,
} from "@/services/auth"

export function usePasswordResetRequest() {
  return useMutation<void, NormalizedApiError, ResetPasswordPayload>({
    mutationFn: (vars) => {
      console.info(
        `[auth-debug] usePasswordResetRequest.mutationFn: email='${vars.email}'`
      )
      return requestPasswordReset(vars)
    },
    onSuccess: () => {
      console.info("[auth-debug] usePasswordResetRequest.onSuccess")
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] usePasswordResetRequest.onError: status=${err.status} message='${err.message}'`
      )
    },
  })
}
