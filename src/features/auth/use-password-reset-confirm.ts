"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import {
  confirmPasswordReset,
  type ResetPasswordConfirmPayload,
} from "@/services/auth"

export function usePasswordResetConfirm() {
  return useMutation<void, NormalizedApiError, ResetPasswordConfirmPayload>({
    mutationFn: confirmPasswordReset,
    onError: (err) => {
      logger.warn("Password reset confirmation failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
