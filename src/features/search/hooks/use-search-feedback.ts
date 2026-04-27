"use client"

import { useMutation } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import {
  createSearchFeedback,
  type SearchFeedback,
  type SearchFeedbackCreateInput,
} from "@/services/search"

export function useSearchFeedback() {
  return useMutation<SearchFeedback, NormalizedApiError, SearchFeedbackCreateInput>({
    mutationFn: createSearchFeedback,
    onError: (err) => {
      logger.warn("Search feedback failed", { status: err.status })
    },
  })
}
