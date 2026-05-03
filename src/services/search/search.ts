import { apiClient, tokenStore, withGuestToken } from "@/lib/api"

import { SEARCH_PATHS } from "./paths"
import type {
  SearchExecutionSummary,
  SearchResponse,
  SearchSubmissionEnvelope,
  SearchSubmitInput,
} from "./types"

export const SEARCH_GUEST_TOKEN_KEY = "search"

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
  const res = await apiClient.get<SearchExecutionSummary>(
    pollUrl,
    guestTokenConfig()
  )
  return res.data
}

export async function getExecutionResponse(
  responseUrl: string
): Promise<SearchResponse> {
  const res = await apiClient.get<SearchResponse>(
    responseUrl,
    guestTokenConfig()
  )
  return res.data
}
