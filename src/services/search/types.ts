export type ExecutionStatus =
  | "pending"
  | "queued"
  | "running"
  | "succeeded"
  | "partial"
  | "failed"
  | "canceled"

export const TERMINAL_EXECUTION_STATUSES: ReadonlyArray<ExecutionStatus> = [
  "succeeded",
  "partial",
  "failed",
  "canceled",
]

export function isTerminalStatus(
  status: ExecutionStatus | undefined | null
): status is ExecutionStatus {
  if (!status) return false
  return (TERMINAL_EXECUTION_STATUSES as ReadonlyArray<string>).includes(status)
}

export type SearchSubmitInput = {
  query: string
  filters?: SearchFilters
}

export type SearchFilters = {
  surahs?: number[]
}

export type SearchExecutionSummary = {
  id: number
  query_id: number
  execution_number: number
  status: ExecutionStatus
  mode: "sync" | "async"
  started_at: string | null
  completed_at: string | null
  latency_ms: number | null
  response_available: boolean
  created_at: string
  updated_at: string
  error_code?: string
  error_message?: string
}

export type SearchBlockType = "text" | "markdown" | "surah_distribution"

export type TextBlockPayload = {
  headline?: string
  details: string
}

export type MarkdownBlockPayload = {
  headline?: string
  content: string
}

export type SurahDistributionPayload = {
  values: { surah: number; value: number }[]
  y_label?: string
  max_value?: number
}

export type SearchResponseBlock = {
  id: number
  block_type: SearchBlockType | string
  order: number
  title: string
  payload: Record<string, unknown>
  explanation: string
  confidence: number | null
  provenance: Record<string, unknown>
  warning_text: string
  items: unknown[]
}

export type SearchResponse = {
  id: number
  execution: number
  title: string
  overall_confidence: number | null
  render_schema_version: string
  metadata: Record<string, unknown>
  blocks: SearchResponseBlock[]
  created_at: string
  updated_at: string
}

export type SearchSubmissionEnvelope = {
  query_id: number
  execution_id: number
  execution_status: ExecutionStatus
  mode: "sync" | "async"
  guest_token?: string
  poll_url: string
  response_url: string
  response: SearchResponse | null
}

export type SearchBookmark = {
  id: number
  response: number | null
  result_item: number | null
  note: string
  created_at: string
  updated_at: string
}

export type SearchBookmarkCreateInput = {
  response_id?: number
  result_item_id?: number
  note?: string
}

export const SEARCH_FEEDBACK_TYPES = [
  "helpful",
  "not_helpful",
  "relevant",
  "not_relevant",
  "incorrect",
  "report_issue",
] as const

export type SearchFeedbackType = (typeof SEARCH_FEEDBACK_TYPES)[number]

export type SearchFeedbackCreateInput = {
  feedback_type: SearchFeedbackType
  comment?: string
  metadata?: Record<string, unknown>
  search_query_id?: number
  execution_id?: number
  response_id?: number
  response_block_id?: number
  result_item_id?: number
}

export type SearchFeedback = {
  id: number
  feedback_type: SearchFeedbackType
  comment: string
  metadata: Record<string, unknown>
  search_query: number | null
  execution: number | null
  response: number | null
  response_block: number | null
  result_item: number | null
  created_at: string
  updated_at: string
}
