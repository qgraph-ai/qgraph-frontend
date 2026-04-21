"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import {
  registerUser,
  type CurrentUser,
  type RegisterPayload,
} from "@/services/auth"

export function useRegister() {
  return useMutation<CurrentUser, NormalizedApiError, RegisterPayload>({
    mutationFn: (vars) => {
      console.info(
        `[auth-debug] useRegister.mutationFn: submitting email='${vars.email}' (passwords redacted)`
      )
      return registerUser(vars)
    },
    onSuccess: (user) => {
      console.info(
        `[auth-debug] useRegister.onSuccess: user.id=${user?.id} email='${user?.email}'`
      )
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] useRegister.onError: status=${err.status} code=${err.code} message='${err.message}' details=${JSON.stringify(err.details)?.slice(0, 500)}`
      )
    },
  })
}
