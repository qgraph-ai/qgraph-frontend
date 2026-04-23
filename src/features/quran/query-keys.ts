export const QURAN_QUERY_KEYS = {
  surahs: ["quran", "surahs"] as const,
  surahDetail: (n: number) => ["quran", "surah", n] as const,
  surahAyahs: (n: number) => ["quran", "surah", n, "ayahs"] as const,
}
