import Link from "next/link"

type ComingSoonShellProps = {
  title: string
  description: string
  backToLandingLabel: string
  queryLabel?: string
  queryValue?: string | null
  emptyQueryLabel?: string
}

export function ComingSoonShell({
  title,
  description,
  backToLandingLabel,
  queryLabel,
  queryValue,
  emptyQueryLabel,
}: ComingSoonShellProps) {
  const hasQuery = Boolean(queryValue?.trim())

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-18 md:py-24">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-8 shadow-sm backdrop-blur md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,theme(colors.primary.DEFAULT/12%)_0%,transparent_62%)]"
        />
        <div className="flex flex-col items-start gap-5 text-start">
          <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>

          {queryLabel ? (
            <div className="rounded-lg border border-border/70 bg-background/80 px-4 py-3">
              {hasQuery ? (
                <p className="flex flex-col gap-1.5">
                  <span className="text-[0.72rem] uppercase tracking-[0.18em] text-muted-foreground">
                    {queryLabel}
                  </span>
                  <span className="break-all text-sm text-foreground md:text-base">
                    {queryValue}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {emptyQueryLabel}
                </p>
              )}
            </div>
          ) : null}

          <Link
            href="/"
            className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {backToLandingLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
