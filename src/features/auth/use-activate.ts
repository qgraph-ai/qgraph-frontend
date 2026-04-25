"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import { activateUser, type ActivationPayload } from "@/services/auth"

export function useActivate() {
  return useMutation<void, NormalizedApiError, ActivationPayload>({
    mutationFn: activateUser,
    onError: (err) => {
      logger.warn("Activation request failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
