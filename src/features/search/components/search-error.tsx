"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

export function SearchError({
  title,
  message,
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  const t = useTranslations("search.states")
  return (
    <div
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-foreground"
    >
      <h2 className="font-medium">{title ?? t("errorTitle")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {message ?? t("errorBody")}
      </p>
      {onRetry ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={onRetry}
        >
          {t("retry")}
        </Button>
      ) : null}
    </div>
  )
}
