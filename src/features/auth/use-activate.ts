"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { activateUser, type ActivationPayload } from "@/services/auth"

export function useActivate() {
  return useMutation<void, NormalizedApiError, ActivationPayload>({
    mutationFn: (vars) => {
      console.info(
        `[auth-debug] useActivate.mutationFn: uid='${vars.uid}' tokenLen=${vars.token?.length ?? 0}`
      )
      return activateUser(vars)
    },
    onSuccess: () => {
      console.info("[auth-debug] useActivate.onSuccess")
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] useActivate.onError: status=${err.status} message='${err.message}' details=${JSON.stringify(err.details)?.slice(0, 500)}`
      )
    },
  })
}
