import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { BrandOrnament } from "@/components/brand-mark"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Separator } from "@/components/ui/separator"
import { SurahIndex } from "@/features/quran/components/surah-index"
import { SURAH_COUNT } from "@/features/quran/lib/constants"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("segmentation")
  const tIndex = await getTranslations("segmentation.index")
  return {
    title: t("metaTitle"),
    description: tIndex("metaDescription"),
    alternates: { canonical: "/segmentation" },
    openGraph: {
      title: t("metaTitle"),
      description: tIndex("metaDescription"),
      url: "/segmentation",
    },
    twitter: {
      card: "summary",
      title: t("metaTitle"),
      description: tIndex("metaDescription"),
    },
  }
}

export default async function SegmentationIndexPage() {
  const t = await getTranslations("segmentation.index")

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-7 px-6 pt-20 pb-10 text-center md:pt-28 md:pb-14">
          <span className="inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
            <BrandOrnament className="size-2.5 opacity-70" />
            <span>{t("kicker")}</span>
            <BrandOrnament className="size-2.5 opacity-70" />
          </span>
          <h1 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-md text-balance text-sm text-muted-foreground md:text-base">
            {t("subtitle")}
          </p>
          <Separator className="mt-2 w-12 opacity-60" />
          <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            {t("count", { count: SURAH_COUNT })}
          </span>
        </section>

        <section className="mx-auto max-w-3xl px-2 pb-24 md:px-6">
          <SurahIndex basePath="/segmentation" />
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
