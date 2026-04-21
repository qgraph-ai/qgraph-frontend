"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import {
  resendActivation,
  type ResendActivationPayload,
} from "@/services/auth"

export function useResendActivation() {
  return useMutation<void, NormalizedApiError, ResendActivationPayload>({
    mutationFn: (vars) => {
      console.info(
        `[auth-debug] useResendActivation.mutationFn: email='${vars.email}'`
      )
      return resendActivation(vars)
    },
    onSuccess: () => {
      console.info("[auth-debug] useResendActivation.onSuccess")
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] useResendActivation.onError: status=${err.status} message='${err.message}'`
      )
    },
  })
}
