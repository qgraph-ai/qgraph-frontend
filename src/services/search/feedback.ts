import { apiClient } from "@/lib/api"

import { SEARCH_PATHS } from "./paths"
import type { SearchFeedback, SearchFeedbackCreateInput } from "./types"

export async function createSearchFeedback(
  input: SearchFeedbackCreateInput
): Promise<SearchFeedback> {
  const res = await apiClient.post<SearchFeedback>(SEARCH_PATHS.feedback, input)
  return res.data
}
