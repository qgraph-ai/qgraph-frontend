import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Skeleton } from "@/components/ui/skeleton"

const AYAHS = Array.from({ length: 6 })

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <header className="mx-auto flex max-w-2xl flex-col items-center gap-5 pt-20 pb-12 text-center md:pt-28">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-14 w-60 max-w-full" />
            <Skeleton className="h-5 w-40 max-w-full" />
            <Skeleton className="h-3 w-32" />
          </header>
          <ol aria-hidden className="mx-auto max-w-2xl space-y-8 py-6">
            {AYAHS.map((_, i) => (
              <li key={i} className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-11/12" />
                <Skeleton className="h-6 w-3/4" />
              </li>
            ))}
          </ol>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
