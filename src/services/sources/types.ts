export const SOURCE_TYPE_VALUES = [
  "website",
  "dataset",
  "book",
  "paper",
  "article",
  "software",
  "api",
  "other",
] as const

export type SourceType = (typeof SOURCE_TYPE_VALUES)[number]

export type SourceReference = {
  id: number
  title: string
  source_type: SourceType
  authors_or_organization: string
  year: number | null
  url: string
  publisher: string
  identifier: string
  description: string
  usage_note: string
  license_name: string
  license_url: string
  accessed_at: string | null
  display_order: number
}

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
