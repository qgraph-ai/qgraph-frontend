import { cache } from "react"

import { apiClient } from "@/lib/api"

import { SOURCES_PATHS } from "./paths"
import type { Paginated, SourceReference } from "./types"

export const listSources = cache(async (): Promise<SourceReference[]> => {
  const res = await apiClient.get<Paginated<SourceReference> | SourceReference[]>(
    SOURCES_PATHS.list
  )
  return Array.isArray(res.data) ? res.data : res.data.results
})
