import { ArrowUpRight } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { SourceReference } from "@/services/sources"

const has = (value: string | null | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0

function yearFromAccessedAt(accessedAt: string | null): number | null {
  if (!accessedAt) return null
  const year = Number(accessedAt.slice(0, 4))
  return Number.isFinite(year) ? year : null
}

export async function SourceCard({ source }: { source: SourceReference }) {
  const t = await getTranslations("references")
  const typeLabel = t(`types.${source.source_type}`)
  const accessedYear = yearFromAccessedAt(source.accessed_at)
  const showMetadata =
    has(source.publisher) ||
    has(source.identifier) ||
    has(source.license_name) ||
    accessedYear !== null

  return (
    <Card className="gap-5 px-1 py-6 ring-foreground/8">
      <div className="flex items-baseline justify-between gap-3 px-4">
        <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          {typeLabel}
        </span>
        {source.year !== null && (
          <span className="text-[0.65rem] uppercase tracking-[0.22em] tabular-nums text-muted-foreground">
            {source.year}
          </span>
        )}
      </div>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-balance text-xl font-semibold tracking-tight md:text-2xl">
            {source.title}
          </h2>
          {has(source.authors_or_organization) && (
            <p className="text-sm text-muted-foreground">
              {source.authors_or_organization}
            </p>
          )}
        </div>

        {has(source.description) && (
          <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
            {source.description}
          </p>
        )}

        {has(source.usage_note) && (
          <p className="border-s-2 border-border/60 ps-3 text-sm italic text-muted-foreground">
            {source.usage_note}
          </p>
        )}

        {showMetadata && (
          <>
            <Separator className="opacity-60" />
            <dl className="grid grid-cols-[max-content_1fr] gap-x-5 gap-y-1.5 text-sm">
              {has(source.publisher) && (
                <>
                  <dt className="text-muted-foreground">{t("fields.publisher")}</dt>
                  <dd className="text-foreground/90">{source.publisher}</dd>
                </>
              )}
              {has(source.identifier) && (
                <>
                  <dt className="text-muted-foreground">{t("fields.identifier")}</dt>
                  <dd className="text-foreground/90 tabular-nums">
                    {source.identifier}
                  </dd>
                </>
              )}
              {has(source.license_name) && (
                <>
                  <dt className="text-muted-foreground">{t("fields.license")}</dt>
                  <dd className="text-foreground/90">
                    {has(source.license_url) ? (
                      <a
                        href={source.license_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {source.license_name}
                      </a>
                    ) : (
                      source.license_name
                    )}
                  </dd>
                </>
              )}
              {accessedYear !== null && (
                <>
                  <dt className="text-muted-foreground">{t("fields.accessed")}</dt>
                  <dd className="text-foreground/90 tabular-nums">{accessedYear}</dd>
                </>
              )}
            </dl>
          </>
        )}

        {has(source.url) && (
          <div className="pt-1">
            <Button asChild variant="outline" size="sm">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("actions.visitSourceAria", { title: source.title })}
              >
                <span>{t("actions.visitSource")}</span>
                <ArrowUpRight aria-hidden />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
