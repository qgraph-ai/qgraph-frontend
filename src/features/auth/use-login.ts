"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import { login, type CurrentUser, type LoginPayload } from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation<CurrentUser, NormalizedApiError, LoginPayload>({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, user)
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me })
    },
    onError: (err) => {
      logger.warn("Sign-in request failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
