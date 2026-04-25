import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Skeleton } from "@/components/ui/skeleton"

const SEGMENTS = Array.from({ length: 4 })

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <header className="mx-auto flex max-w-2xl flex-col items-center gap-5 pt-20 pb-12 text-center md:pt-28">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-14 w-60 max-w-full" />
            <Skeleton className="h-5 w-40 max-w-full" />
            <Skeleton className="h-3 w-32" />
          </header>

          <div className="mx-auto mb-6 flex max-w-2xl items-center justify-end">
            <Skeleton className="h-9 w-56" />
          </div>

          <div
            aria-hidden
            className="mx-auto flex max-w-2xl flex-col gap-5 py-2"
          >
            {SEGMENTS.map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-card/40 px-4 py-4 md:px-6 md:py-5"
              >
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-11/12" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
