import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { BrandOrnament } from "@/components/brand-mark"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Separator } from "@/components/ui/separator"
import { SourceCard } from "@/features/references/components/source-card"
import { listSources } from "@/services/sources"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("references")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/references" },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: "/references",
    },
    twitter: {
      card: "summary",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  }
}

export default async function ReferencesPage() {
  const t = await getTranslations("references")
  const sources = await listSources()

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
          {sources.length > 0 && (
            <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t("count", { count: sources.length })}
            </span>
          )}
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-24 md:px-6">
          {sources.length === 0 ? (
            <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-16 text-center">
              <BrandOrnament className="size-4 text-muted-foreground/70" />
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                {t("empty.title")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("empty.body")}</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-6">
              {sources.map((source) => (
                <li key={source.id}>
                  <SourceCard source={source} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
