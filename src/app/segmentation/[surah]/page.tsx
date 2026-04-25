import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BrandOrnament } from "@/components/brand-mark"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Bismillah } from "@/features/quran/components/bismillah"
import { SurahHeader } from "@/features/quran/components/surah-header"
import { SurahPager } from "@/features/quran/components/surah-pager"
import {
  SURAH_FATIHA_NUMBER,
  SURAH_TAWBAH_NUMBER,
} from "@/features/quran/lib/constants"
import { parseSurahNumber } from "@/features/quran/lib/parse"
import { SegmentedAyahStream } from "@/features/segmentation/components/segmented-ayah-stream"
import { VersionPicker } from "@/features/segmentation/components/version-picker"
import { getSurah } from "@/services/quran"
import {
  getFeaturedWorkspace,
  listSegmentationVersions,
  type SegmentationVersion,
} from "@/services/segmentation"

type Params = Promise<{ surah: string }>
type Search = Promise<{ v?: string }>

async function loadVersions(
  surahNumber: number
): Promise<SegmentationVersion[]> {
  const workspace = await getFeaturedWorkspace()
  const data = await listSegmentationVersions(workspace.slug, {
    surah: surahNumber,
    status: "active",
    ordering: "recent",
  })
  return data.results
}

function pickCurrentVersion(
  versions: SegmentationVersion[],
  requested: string | undefined
): SegmentationVersion | null {
  if (versions.length === 0) return null
  if (requested) {
    const match = versions.find((v) => v.public_id === requested)
    if (match) return match
  }
  return versions[0]
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const t = await getTranslations("segmentation.readerMetadata")
  const { surah } = await params
  const number = parseSurahNumber(surah)
  if (number === null) return {}
  try {
    const data = await getSurah(number)
    const name = data.transliteration
    const title = t("title", { number: data.number, name })
    const description = t("description", { number: data.number, name })
    return {
      title,
      description,
      alternates: { canonical: `/segmentation/${data.number}` },
      openGraph: {
        title,
        description,
        url: `/segmentation/${data.number}`,
      },
      twitter: { card: "summary", title, description },
    }
  } catch {
    return {}
  }
}

export default async function SegmentationReaderPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  const { surah } = await params
  const { v } = await searchParams
  const number = parseSurahNumber(surah)
  if (number === null) notFound()

  const [data, versions] = await Promise.all([
    getSurah(number),
    loadVersions(number),
  ])

  const showBismillah =
    data.number !== SURAH_FATIHA_NUMBER && data.number !== SURAH_TAWBAH_NUMBER

  const currentVersion = pickCurrentVersion(versions, v)

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <article
          aria-labelledby={`surah-${data.number}-name`}
          className="mx-auto max-w-3xl px-6 pb-20"
        >
          <SurahHeader surah={data} i18nNamespace="segmentation.reader" />
          {showBismillah ? <Bismillah /> : null}

          {currentVersion ? (
            <>
              <VersionPicker
                versions={versions}
                currentPublicId={currentVersion.public_id}
              />
              <SegmentedAyahStream
                surahNumber={data.number}
                versionPublicId={currentVersion.public_id}
              />
            </>
          ) : (
            <SegmentationEmptyState />
          )}

          <SurahPager
            current={data.number}
            basePath="/segmentation"
            i18nNamespace="segmentation.reader"
          />
        </article>
      </main>
      <SiteFooter />
    </>
  )
}

async function SegmentationEmptyState() {
  const t = await getTranslations("segmentation.empty")
  return (
    <section className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
      <BrandOrnament className="size-4 text-muted-foreground/70" />
      <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
        {t("title")}
      </h2>
      <p className="text-sm text-muted-foreground">{t("body")}</p>
      <Button variant="outline" asChild>
        <Link href="/segmentation">{t("backToIndex")}</Link>
      </Button>
    </section>
  )
}
