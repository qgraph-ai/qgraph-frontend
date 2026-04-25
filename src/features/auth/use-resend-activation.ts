"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import {
  resendActivation,
  type ResendActivationPayload,
} from "@/services/auth"

export function useResendActivation() {
  return useMutation<void, NormalizedApiError, ResendActivationPayload>({
    mutationFn: resendActivation,
    onError: (err) => {
      logger.warn("Resend activation request failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
