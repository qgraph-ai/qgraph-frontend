"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
import {
  submitSearch,
  type SearchSubmissionEnvelope,
  type SearchSubmitInput,
} from "@/services/search"

import { SEARCH_QUERY_KEYS } from "../query-keys"

export function useSearchSubmit() {
  const queryClient = useQueryClient()
  return useMutation<SearchSubmissionEnvelope, NormalizedApiError, SearchSubmitInput>({
    mutationFn: submitSearch,
    onSuccess: (envelope) => {
      if (envelope.response) {
        queryClient.setQueryData(
          SEARCH_QUERY_KEYS.response(envelope.execution_id),
          envelope.response
        )
      }
    },
    onError: (err) => {
      logger.warn("Search submission failed", {
        status: err.status,
        code: err.code,
      })
    },
  })
}
