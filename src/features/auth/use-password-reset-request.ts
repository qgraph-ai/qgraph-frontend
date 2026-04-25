"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import {
  requestPasswordReset,
  type ResetPasswordPayload,
} from "@/services/auth"

export function usePasswordResetRequest() {
  return useMutation<void, NormalizedApiError, ResetPasswordPayload>({
    mutationFn: requestPasswordReset,
    onError: (err) => {
      logger.warn("Password reset request failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
