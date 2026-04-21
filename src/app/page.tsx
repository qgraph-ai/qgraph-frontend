import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { AppGrid } from "@/features/landing/app-grid"
import { AyahCard } from "@/features/landing/ayah-card"
import { Differentiators } from "@/features/landing/differentiators"
import { Hero } from "@/features/landing/hero"

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
