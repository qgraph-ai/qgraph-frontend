"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import {
  confirmEmailChange,
  type ConfirmEmailChangePayload,
} from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useConfirmEmailChange() {
  const queryClient = useQueryClient()
  return useMutation<void, NormalizedApiError, ConfirmEmailChangePayload>({
    mutationFn: confirmEmailChange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me })
    },
    onError: (err) => {
      logger.warn("Confirm email change request failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
