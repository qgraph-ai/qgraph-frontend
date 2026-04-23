import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { BrandOrnament } from "@/components/brand-mark"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"

export default async function SurahNotFound() {
  const t = await getTranslations("quran.notFound")

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto flex max-w-md flex-col items-center gap-6 px-6 py-28 text-center">
          <BrandOrnament className="size-4 text-muted-foreground/70" />
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("body")}</p>
          <Button variant="outline" asChild>
            <Link href="/quran">{t("backToIndex")}</Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
