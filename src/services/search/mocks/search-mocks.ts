import type { NormalizedApiError } from "@/lib/api"

import type {
  ExecutionStatus,
  SearchExecutionSummary,
  SearchFilters,
  SearchResponse,
  SearchSubmissionEnvelope,
  SearchSubmitInput,
} from "../types"

const SIMULATED_DURATION_MS = 2_500
const SURAH_COUNT = 114

type MockJob = {
  executionId: number
  queryId: number
  query: string
  filters: SearchFilters
  startedAt: number
}

const jobs = new Map<number, MockJob>()
let nextId = 1

function nowMs(): number {
  return Date.now()
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateDistribution(
  query: string,
  filters: SearchFilters
): { surah: number; value: number }[] {
  const seed = hashString(`distribution:${query}:${(filters.surahs ?? []).join(",")}`)
  const rand = mulberry32(seed || 1)
  const allowed = filters.surahs && filters.surahs.length > 0
    ? new Set(filters.surahs)
    : null
  const out: { surah: number; value: number }[] = []
  for (let surah = 1; surah <= SURAH_COUNT; surah++) {
    if (allowed && !allowed.has(surah)) continue
    const r = rand()
    const value = r < 0.7 ? 0 : Math.floor(r * 30) + 1
    out.push({ surah, value })
  }
  return out
}

function deriveStatus(job: MockJob): ExecutionStatus {
  const elapsed = nowMs() - job.startedAt
  if (elapsed < SIMULATED_DURATION_MS * 0.25) return "pending"
  if (elapsed < SIMULATED_DURATION_MS) return "running"
  return "succeeded"
}

function buildResponse(job: MockJob): SearchResponse {
  const filters = job.filters
  const filterSummary =
    filters.surahs && filters.surahs.length > 0
      ? ` (filtered to ${filters.surahs.length} surah${filters.surahs.length === 1 ? "" : "s"})`
      : ""

  const distribution = generateDistribution(job.query, filters)
  const total = distribution.reduce((sum, entry) => sum + entry.value, 0)
  const peak = distribution.reduce(
    (best, entry) => (entry.value > best.value ? entry : best),
    { surah: 0, value: 0 }
  )

  const now = new Date().toISOString()

  return {
    id: job.executionId,
    execution: job.executionId,
    title: `Mock results for "${job.query}"${filterSummary}`,
    overall_confidence: 0.74,
    render_schema_version: "v1",
    metadata: { mock: true },
    blocks: [
      {
        id: job.executionId * 10 + 1,
        block_type: "text",
        order: 0,
        title: `Concept overview for "${job.query}"`,
        payload: {
          details:
            `This is mock data — the AI backend has not yet been wired up to /api/v1/search/.\n\n` +
            `Across the Qur'an, the term you searched for has approximately ${total} simulated mentions, peaking in surah ${peak.surah || "—"} with ${peak.value} occurrences.${filterSummary ? ` Results are restricted to your ${filters.surahs?.length} selected surah${filters.surahs?.length === 1 ? "" : "s"}.` : ""}\n\n` +
            `When the real backend conforms to .ai/contracts/search_response_contract.md, set NEXT_PUBLIC_SEARCH_USE_MOCKS=false to swap in real responses.`,
        },
        explanation: "Generated locally; deterministic per query+filter.",
        confidence: 0.82,
        provenance: { source: "mock" },
        warning_text: "",
        items: [],
      },
      {
        id: job.executionId * 10 + 2,
        block_type: "surah_distribution",
        order: 1,
        title: `Distribution across surahs`,
        payload: {
          values: distribution,
          y_label: "Mentions",
        },
        explanation: "",
        confidence: 0.88,
        provenance: { source: "mock" },
        warning_text: "",
        items: [],
      },
    ],
    created_at: now,
    updated_at: now,
  }
}

export function mockSubmit(input: SearchSubmitInput): SearchSubmissionEnvelope {
  const executionId = nextId++
  const queryId = executionId
  const job: MockJob = {
    executionId,
    queryId,
    query: input.query,
    filters: input.filters ?? {},
    startedAt: nowMs(),
  }
  jobs.set(executionId, job)

  return {
    query_id: queryId,
    execution_id: executionId,
    execution_status: "pending",
    mode: "async",
    guest_token: `mock-guest-${executionId}`,
    poll_url: `/api/v1/search/executions/${executionId}/`,
    response_url: `/api/v1/search/executions/${executionId}/response/`,
    response: null,
  }
}

function makeMockExecution(job: MockJob): SearchExecutionSummary {
  const status = deriveStatus(job)
  return {
    id: job.executionId,
    query_id: job.queryId,
    execution_number: 1,
    status,
    mode: "async",
    started_at: new Date(job.startedAt).toISOString(),
    completed_at:
      status === "succeeded" ? new Date().toISOString() : null,
    latency_ms: status === "succeeded" ? SIMULATED_DURATION_MS : null,
    response_available: status === "succeeded",
    created_at: new Date(job.startedAt).toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function notFound(): NormalizedApiError {
  return {
    message: "Mock execution not found.",
    status: 404,
    code: null,
    details: null,
  }
}

function notReady(): NormalizedApiError {
  return {
    message: "Mock response not ready yet.",
    status: 409,
    code: null,
    details: null,
  }
}

export function mockGetExecution(id: number): SearchExecutionSummary {
  const job = jobs.get(id)
  if (!job) throw notFound()
  return makeMockExecution(job)
}

export function mockGetResponse(id: number): SearchResponse {
  const job = jobs.get(id)
  if (!job) throw notFound()
  if (deriveStatus(job) !== "succeeded") throw notReady()
  return buildResponse(job)
}
