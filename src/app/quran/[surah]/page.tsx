import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { AyahStream } from "@/features/quran/components/ayah-stream"
import { Bismillah } from "@/features/quran/components/bismillah"
import { SurahHeader } from "@/features/quran/components/surah-header"
import { SurahPager } from "@/features/quran/components/surah-pager"
import {
  SURAH_COUNT,
  SURAH_FATIHA_NUMBER,
  SURAH_TAWBAH_NUMBER,
} from "@/features/quran/lib/constants"
import { getSurah } from "@/services/quran"

function parseSurahNumber(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 1 || n > SURAH_COUNT) return null
  return n
}

type Params = Promise<{ surah: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { surah } = await params
  const number = parseSurahNumber(surah)
  if (number === null) return {}
  try {
    const data = await getSurah(number)
    const title = `Surah ${data.transliteration}`
    const description = data.english_name
      ? `Read surah ${data.transliteration} (${data.english_name}) in Arabic.`
      : `Read surah ${data.transliteration} in Arabic.`
    return { title, description }
  } catch {
    return {}
  }
}

export default async function SurahReaderPage({ params }: { params: Params }) {
  const { surah } = await params
  const number = parseSurahNumber(surah)
  if (number === null) notFound()

  const data = await getSurah(number)

  const showBismillah =
    data.number !== SURAH_FATIHA_NUMBER && data.number !== SURAH_TAWBAH_NUMBER

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <article
          aria-labelledby={`surah-${data.number}-name`}
          className="mx-auto max-w-3xl px-6 pb-20"
        >
          <SurahHeader surah={data} />
          {showBismillah ? <Bismillah /> : null}
          <AyahStream surahNumber={data.number} />
          <SurahPager current={data.number} />
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
