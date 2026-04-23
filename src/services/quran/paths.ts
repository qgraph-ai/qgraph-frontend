export const QURAN_PATHS = {
  surahs: "/api/v1/quran/surahs/",
  surahDetail: (number: number) => `/api/v1/quran/surahs/${number}/`,
  surahAyahs: (number: number) => `/api/v1/quran/surahs/${number}/ayahs/`,
} as const

export type QuranStaticPath = typeof QURAN_PATHS.surahs
