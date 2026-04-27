"use client"

import { useQuery } from "@tanstack/react-query"

import { listSurahs, type Surah } from "@/services/quran"

const SURAH_LIST_QUERY_KEY = ["quran", "surahs", "all"] as const

export function useSurahNames() {
  return useQuery<Map<number, Surah>, Error>({
    queryKey: SURAH_LIST_QUERY_KEY,
    queryFn: async () => {
      const page = await listSurahs({ page_size: 200 })
      return new Map(page.results.map((s) => [s.number, s]))
    },
    staleTime: 60 * 60_000,
  })
}
