import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Skeleton } from "@/components/ui/skeleton"

const ROWS = Array.from({ length: 12 })

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
          className="mx-auto max-w-3xl divide-y divide-border/60 px-2 pb-24 md:px-6"
        >
          {ROWS.map((_, i) => (
            <li
              key={i}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-5 px-2 py-5 md:gap-6 md:px-3"
            >
              <Skeleton className="size-9 rounded-full" />
              <div className="flex min-w-0 flex-col gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-14" />
              </div>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  )
}
