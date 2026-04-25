import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { AppGrid } from "@/features/landing/app-grid"
import { AyahCard } from "@/features/landing/ayah-card"
import { Differentiators } from "@/features/landing/differentiators"
import { Hero } from "@/features/landing/hero"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("hero")
  return {
    description: t("subtitle"),
    alternates: { canonical: "/" },
    openGraph: {
      title: "QGraph",
      description: t("subtitle"),
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: "QGraph",
      description: t("subtitle"),
    },
  }
}

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <AppGrid />
        <AyahCard />
        <Differentiators />
      </main>
      <SiteFooter />
    </>
  )
}
