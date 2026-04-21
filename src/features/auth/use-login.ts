"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { login, type CurrentUser, type LoginPayload } from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation<CurrentUser, NormalizedApiError, LoginPayload>({
    mutationFn: (vars) => {
      console.info(
        `[auth-debug] useLogin.mutationFn: submitting email='${vars.email}' (password redacted)`
      )
      return login(vars)
    },
    onSuccess: (user) => {
      console.info(
        `[auth-debug] useLogin.onSuccess: setting auth.me cache + invalidating. user.id=${user?.id} email='${user?.email}'`
      )
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, user)
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me })
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] useLogin.onError: status=${err.status} code=${err.code} message='${err.message}' details=${JSON.stringify(err.details)?.slice(0, 500)}`
      )
    },
  })
}
