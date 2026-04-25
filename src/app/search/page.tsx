import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ComingSoonShell } from "@/features/coming-soon/components/coming-soon-shell"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("search")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/search" },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: "/search",
    },
    twitter: {
      card: "summary",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  }
}

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
        <ComingSoonShell
          title={t("placeholderTitle")}
          description={t("placeholderDescription")}
          queryLabel={t("placeholderQueryLabel")}
          queryValue={trimmed}
          emptyQueryLabel={t("placeholderEmpty")}
          backToLandingLabel={t("backToLanding")}
        />
      </main>
      <SiteFooter />
    </>
  )
}
