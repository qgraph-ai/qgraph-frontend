import { apiClient } from "@/lib/api"

import { SEARCH_USE_MOCKS } from "./dev-flags"
import { SEARCH_PATHS } from "./paths"
import type { SearchFeedback, SearchFeedbackCreateInput } from "./types"

let nextMockFeedbackId = 1

export async function createSearchFeedback(
  input: SearchFeedbackCreateInput
): Promise<SearchFeedback> {
  if (SEARCH_USE_MOCKS) {
    const now = new Date().toISOString()
    return {
      id: nextMockFeedbackId++,
      feedback_type: input.feedback_type,
      comment: input.comment ?? "",
      metadata: input.metadata ?? {},
      search_query: input.search_query_id ?? null,
      execution: input.execution_id ?? null,
      response: input.response_id ?? null,
      response_block: input.response_block_id ?? null,
      result_item: input.result_item_id ?? null,
      created_at: now,
      updated_at: now,
    }
  }
  const res = await apiClient.post<SearchFeedback>(SEARCH_PATHS.feedback, input)
  return res.data
}
