import { cache } from "react"

import { apiClient } from "@/lib/api"

import { QURAN_PATHS } from "./paths"
import type {
  Ayah,
  ListSurahAyahsParams,
  ListSurahsParams,
  Paginated,
  Surah,
} from "./types"

export const listSurahs = cache(
  async (params: ListSurahsParams = {}): Promise<Paginated<Surah>> => {
    const res = await apiClient.get<Paginated<Surah>>(QURAN_PATHS.surahs, {
      params,
    })
    return res.data
  }
)

export const getSurah = cache(async (number: number): Promise<Surah> => {
  const res = await apiClient.get<Surah>(QURAN_PATHS.surahDetail(number))
  return res.data
})

export const listSurahAyahs = cache(
  async (
    number: number,
    params: ListSurahAyahsParams = {}
  ): Promise<Paginated<Ayah>> => {
    const res = await apiClient.get<Paginated<Ayah>>(
      QURAN_PATHS.surahAyahs(number),
      { params }
    )
    return res.data
  }
)

export const getAllSurahAyahs = cache(async (number: number): Promise<Ayah[]> => {
  const ayahs: Ayah[] = []
  let page = 1
  while (true) {
    const res = await listSurahAyahs(number, {
      page,
      page_size: 300,
      ordering: "number_in_surah",
    })
    ayahs.push(...res.results)
    if (!res.next) break
    page += 1
  }
  return ayahs
})
