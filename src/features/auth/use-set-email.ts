"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import { setEmail, type SetEmailPayload } from "@/services/auth"

export function useSetEmail() {
  return useMutation<void, NormalizedApiError, SetEmailPayload>({
    mutationFn: setEmail,
    onError: (err) => {
      logger.warn("Set email request failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
