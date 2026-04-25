import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ComingSoonShell } from "@/features/coming-soon/components/coming-soon-shell"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("segmentation")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/segmentation" },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: "/segmentation",
    },
    twitter: {
      card: "summary",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  }
}

export default async function SegmentationComingSoonPage() {
  const t = await getTranslations("segmentation")

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <ComingSoonShell
          title={t("placeholderTitle")}
          description={t("placeholderDescription")}
          backToLandingLabel={t("backToLanding")}
        />
      </main>
      <SiteFooter />
    </>
  )
}
