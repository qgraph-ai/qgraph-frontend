"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { setEmail, type SetEmailPayload } from "@/services/auth"

export function useSetEmail() {
  return useMutation<void, NormalizedApiError, SetEmailPayload>({
    mutationFn: (vars) => {
      console.info(
        `[auth-debug] useSetEmail.mutationFn: new_email='${vars.new_email}' (password redacted)`
      )
      return setEmail(vars)
    },
    onSuccess: () => {
      console.info("[auth-debug] useSetEmail.onSuccess")
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] useSetEmail.onError: status=${err.status} message='${err.message}' details=${JSON.stringify(err.details)?.slice(0, 500)}`
      )
    },
  })
}
