import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Skeleton } from "@/components/ui/skeleton"

const CARDS = Array.from({ length: 3 })

export default function Loading() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-20 pb-10 text-center md:pt-28">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-80 max-w-full" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </section>

        <ul
          aria-hidden
          className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-24 md:px-6"
        >
          {CARDS.map((_, i) => (
            <li
              key={i}
              className="flex flex-col gap-4 rounded-xl bg-card p-6 ring-1 ring-foreground/10"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-7 w-32" />
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  )
}
