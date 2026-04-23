import { SURAH_COUNT } from "./constants"

export function parseSurahNumber(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1 || n > SURAH_COUNT) return null
  return n
}
