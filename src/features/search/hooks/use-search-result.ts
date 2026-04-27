"use client"

import { useQuery } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import {
  getExecution,
  getExecutionResponse,
  isTerminalStatus,
  type ExecutionStatus,
  type SearchResponse,
  type SearchSubmissionEnvelope,
} from "@/services/search"

import { SEARCH_QUERY_KEYS } from "../query-keys"

const POLL_INTERVAL_MS = 1500
const MAX_409_RETRIES = 30

export type SearchResultPhase =
  | "idle"
  | "polling"
  | "fetching"
  | "succeeded"
  | "partial"
  | "failed"
  | "canceled"

export type UseSearchResultValue = {
  phase: SearchResultPhase
  response: SearchResponse | null
  executionStatus: ExecutionStatus | null
  error: NormalizedApiError | null
}

export function useSearchResult(
  envelope: SearchSubmissionEnvelope | null
): UseSearchResultValue {
  const executionId = envelope?.execution_id ?? null

  const pollQuery = useQuery<
    { status: ExecutionStatus },
    NormalizedApiError
  >({
    queryKey: executionId
      ? SEARCH_QUERY_KEYS.execution(executionId)
      : ["search", "execution", "idle"],
    queryFn: async () => {
      if (!envelope) throw new Error("no envelope")
      return getExecution(envelope.poll_url)
    },
    enabled: Boolean(envelope) && !envelope?.response,
    refetchInterval: (query) =>
      isTerminalStatus(query.state.data?.status) ? false : POLL_INTERVAL_MS,
    initialData: envelope
      ? { status: envelope.execution_status }
      : undefined,
  })

  const liveStatus: ExecutionStatus | null =
    pollQuery.data?.status ?? envelope?.execution_status ?? null
  const responseAvailable =
    Boolean(envelope?.response) ||
    (liveStatus !== null &&
      isTerminalStatus(liveStatus) &&
      liveStatus !== "failed" &&
      liveStatus !== "canceled")

  const responseQuery = useQuery<SearchResponse, NormalizedApiError>({
    queryKey: executionId
      ? SEARCH_QUERY_KEYS.response(executionId)
      : ["search", "response", "idle"],
    queryFn: async () => {
      if (!envelope) throw new Error("no envelope")
      return getExecutionResponse(envelope.response_url)
    },
    enabled: Boolean(envelope) && responseAvailable,
    retry: (failureCount, error) =>
      error?.status === 409 && failureCount < MAX_409_RETRIES,
    retryDelay: POLL_INTERVAL_MS,
    staleTime: Infinity,
  })

  const phase = derivePhase({
    envelope,
    liveStatus,
    responseLoading: responseQuery.isFetching,
    responseError: responseQuery.error ?? null,
    response: responseQuery.data ?? envelope?.response ?? null,
  })

  return {
    phase,
    response: responseQuery.data ?? envelope?.response ?? null,
    executionStatus: liveStatus,
    error:
      responseQuery.error ??
      pollQuery.error ??
      null,
  }
}

function derivePhase(args: {
  envelope: SearchSubmissionEnvelope | null
  liveStatus: ExecutionStatus | null
  responseLoading: boolean
  responseError: NormalizedApiError | null
  response: SearchResponse | null
}): SearchResultPhase {
  if (!args.envelope) return "idle"
  if (args.liveStatus === "failed") return "failed"
  if (args.liveStatus === "canceled") return "canceled"
  if (args.response) {
    return args.liveStatus === "partial" ? "partial" : "succeeded"
  }
  if (args.responseError && args.responseError.status !== 409) return "failed"
  if (args.liveStatus && isTerminalStatus(args.liveStatus)) {
    return "fetching"
  }
  return "polling"
}
