import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SearchExperience } from "@/features/search/components/search-experience"

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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const trimmed = q?.trim() ?? ""

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <SearchExperience initialQuery={trimmed} />
      </main>
      <SiteFooter />
    </>
  )
}
