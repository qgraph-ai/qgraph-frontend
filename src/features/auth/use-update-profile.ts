"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import {
  updateCurrentUser,
  type CurrentUser,
  type UpdateProfilePayload,
} from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation<CurrentUser, NormalizedApiError, UpdateProfilePayload>({
    mutationFn: updateCurrentUser,
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, user)
    },
    onError: (err) => {
      logger.warn("Update profile request failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
