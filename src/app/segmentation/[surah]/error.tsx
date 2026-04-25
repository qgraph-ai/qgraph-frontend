"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import { BrandOrnament } from "@/components/brand-mark"
import { Button } from "@/components/ui/button"

export default function SegmentationReaderError({
  reset,
}: {
  reset: () => void
}) {
  const t = useTranslations("segmentation.error")

  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-28 text-center">
        <BrandOrnament className="size-4 text-muted-foreground/70" />
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("body")}</p>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={reset}>
            {t("retry")}
          </Button>
          <Button variant="link" asChild>
            <Link href="/segmentation">{t("backToIndex")}</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
