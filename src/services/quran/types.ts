export type RevelationPlace = "meccan" | "medinan"

export type Surah = {
  number: number
  arabic_name: string
  transliteration: string
  english_name?: string
  ayah_count?: number | null
  revelation_place?: RevelationPlace | null
}

export type Ayah = {
  number_global: number
  surah_number: number
  number_in_surah: number
  text_ar: string
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type ListSurahsParams = {
  page?: number
  page_size?: number
  revelation_place?: RevelationPlace
  search?: string
  ordering?: string
}

export type ListSurahAyahsParams = {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
}
