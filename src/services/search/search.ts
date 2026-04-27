import { apiClient, tokenStore, withGuestToken } from "@/lib/api"

import { SEARCH_USE_MOCKS } from "./dev-flags"
import {
  mockGetExecution,
  mockGetResponse,
  mockSubmit,
} from "./mocks/search-mocks"
import { SEARCH_PATHS } from "./paths"
import type {
  SearchExecutionSummary,
  SearchResponse,
  SearchSubmissionEnvelope,
  SearchSubmitInput,
} from "./types"

export const SEARCH_GUEST_TOKEN_KEY = "search"

const USE_MOCKS = SEARCH_USE_MOCKS

function guestTokenConfig() {
  const token = tokenStore.getGuestToken(SEARCH_GUEST_TOKEN_KEY)
  return token ? withGuestToken(token) : undefined
}

function rememberGuestToken(envelope: SearchSubmissionEnvelope): void {
  if (envelope.guest_token) {
    tokenStore.setGuestToken(SEARCH_GUEST_TOKEN_KEY, envelope.guest_token)
  }
}

export async function submitSearch(
  input: SearchSubmitInput
): Promise<SearchSubmissionEnvelope> {
  if (USE_MOCKS) {
    const envelope = mockSubmit(input)
    rememberGuestToken(envelope)
    return envelope
  }
  const res = await apiClient.post<SearchSubmissionEnvelope>(
    SEARCH_PATHS.submit,
    {
      query: input.query,
      filters: input.filters ?? {},
      output_preferences: {},
    }
  )
  rememberGuestToken(res.data)
  return res.data
}

export async function getExecution(
  pollUrl: string
): Promise<SearchExecutionSummary> {
  if (USE_MOCKS) {
    const id = parseExecutionId(pollUrl)
    return mockGetExecution(id)
  }
  const res = await apiClient.get<SearchExecutionSummary>(
    pollUrl,
    guestTokenConfig()
  )
  return res.data
}

export async function getExecutionResponse(
  responseUrl: string
): Promise<SearchResponse> {
  if (USE_MOCKS) {
    const id = parseExecutionId(responseUrl)
    return mockGetResponse(id)
  }
  const res = await apiClient.get<SearchResponse>(
    responseUrl,
    guestTokenConfig()
  )
  return res.data
}

function parseExecutionId(url: string): number {
  const match = url.match(/\/executions\/(\d+)\//)
  if (!match) {
    throw new Error(`Could not parse execution id from URL: ${url}`)
  }
  return Number(match[1])
}
