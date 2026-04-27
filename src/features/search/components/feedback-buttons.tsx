"use client"

import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/use-auth"
import { useSearchFeedback } from "@/features/search/hooks/use-search-feedback"
import { sanitizeReturnTo } from "@/lib/navigation/sanitize-return-to"
import { cn } from "@/lib/utils"
import type { SearchFeedbackType } from "@/services/search"

export function FeedbackButtons({ responseId }: { responseId: number }) {
  const t = useTranslations("search.feedback")
  const tErrors = useTranslations("auth.errors")
  const { status } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const feedback = useSearchFeedback()
  const [submitted, setSubmitted] = useState<SearchFeedbackType | null>(null)

  if (status !== "authenticated") {
    const candidate = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    const safe = sanitizeReturnTo(candidate, "/search")
    const href = `/auth/sign-in?next=${encodeURIComponent(safe)}`
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Button asChild variant="ghost" size="sm" className="gap-1.5" title={t("requiresAuth")}>
          <Link href={href}>
            <ThumbsUpIcon aria-hidden className="size-3.5" />
            {t("helpful")}
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="gap-1.5" title={t("requiresAuth")}>
          <Link href={href}>
            <ThumbsDownIcon aria-hidden className="size-3.5" />
            {t("notHelpful")}
          </Link>
        </Button>
      </div>
    )
  }

  function send(type: SearchFeedbackType) {
    feedback.mutate(
      { feedback_type: type, response_id: responseId },
      {
        onSuccess: () => {
          setSubmitted(type)
          toast.success(t("thanks"), { id: `feedback-${responseId}` })
        },
        onError: () => {
          toast.error(tErrors("generic"), { id: `feedback-${responseId}` })
        },
      }
    )
  }

  const isSubmitted = submitted !== null
  const disabled = isSubmitted || feedback.isPending

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => send("helpful")}
        disabled={disabled}
        aria-pressed={submitted === "helpful"}
        className={cn(
          "gap-1.5",
          submitted === "helpful"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <ThumbsUpIcon
          aria-hidden
          className={cn(
            "size-3.5",
            submitted === "helpful" ? "fill-current" : ""
          )}
        />
        {t("helpful")}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => send("not_helpful")}
        disabled={disabled}
        aria-pressed={submitted === "not_helpful"}
        className={cn(
          "gap-1.5",
          submitted === "not_helpful"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <ThumbsDownIcon
          aria-hidden
          className={cn(
            "size-3.5",
            submitted === "not_helpful" ? "fill-current" : ""
          )}
        />
        {t("notHelpful")}
      </Button>
      {isSubmitted ? (
        <span className="ms-1 text-xs text-muted-foreground" aria-live="polite">
          {t("thanks")}
        </span>
      ) : null}
    </div>
  )
}
