export const SEARCH_PATHS = {
  submit: "/api/v1/search/",
  bookmarks: "/api/v1/search/bookmarks/",
  bookmarkDetail: (id: number) => `/api/v1/search/bookmarks/${id}/`,
  feedback: "/api/v1/search/feedback/",
} as const

export type SearchStaticPath = typeof SEARCH_PATHS.submit
