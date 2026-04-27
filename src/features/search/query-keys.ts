export const SEARCH_QUERY_KEYS = {
  execution: (executionId: number) =>
    ["search", "execution", executionId] as const,
  response: (executionId: number) =>
    ["search", "response", executionId] as const,
  bookmarks: ["search", "bookmarks"] as const,
}
