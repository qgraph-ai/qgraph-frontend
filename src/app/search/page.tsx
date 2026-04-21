import { getTranslations } from "next-intl/server"
import Link from "next/link"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default async function SearchPlaceholderPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const t = await getTranslations("search")
  const trimmed = q?.trim() ?? ""

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 py-24 text-center md:py-32">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {t("placeholderTitle")}
          </h1>
          {trimmed ? (
            <p className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="text-xs uppercase tracking-wide">
                {t("placeholderQueryLabel")}
              </span>
              <span className="text-lg text-foreground">{trimmed}</span>
            </p>
          ) : (
            <p className="text-muted-foreground">{t("placeholderEmpty")}</p>
          )}
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("backToLanding")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
