"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import {
  registerUser,
  type CurrentUser,
  type RegisterPayload,
} from "@/services/auth"

export function useRegister() {
  return useMutation<CurrentUser, NormalizedApiError, RegisterPayload>({
    mutationFn: registerUser,
    onError: (err) => {
      logger.warn("Sign-up request failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
