"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import { setPassword, type SetPasswordPayload } from "@/services/auth"

export function useSetPassword() {
  return useMutation<void, NormalizedApiError, SetPasswordPayload>({
    mutationFn: setPassword,
    onError: (err) => {
      logger.warn("Set password request failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
