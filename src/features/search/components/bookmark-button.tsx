"use client"

import { BookmarkIcon } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/use-auth"
import { useToggleResponseBookmark } from "@/features/search/hooks/use-search-bookmarks"
import { sanitizeReturnTo } from "@/lib/navigation/sanitize-return-to"
import { cn } from "@/lib/utils"

export function BookmarkButton({ responseId }: { responseId: number }) {
  const t = useTranslations("search.bookmark")
  const tErrors = useTranslations("auth.errors")
  const { status } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const toastId = `bookmark-${responseId}`
  const { isBookmarked, isMutating, toggle } = useToggleResponseBookmark(
    status === "authenticated" ? responseId : null,
    {
      onAdded: () => toast.success(t("added"), { id: toastId }),
      onRemoved: () => toast.success(t("removed"), { id: toastId }),
      onError: () => toast.error(tErrors("generic"), { id: toastId }),
    }
  )

  if (status !== "authenticated") {
    const candidate = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
    const safe = sanitizeReturnTo(candidate, "/search")
    const href = `/auth/sign-in?next=${encodeURIComponent(safe)}`
    return (
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground"
        title={t("requiresAuth")}
      >
        <Link href={href}>
          <BookmarkIcon aria-hidden className="size-3.5" />
          {t("add")}
        </Link>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={isMutating}
      aria-pressed={isBookmarked}
      className={cn(
        "gap-1.5",
        isBookmarked
          ? "text-primary hover:text-primary"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <BookmarkIcon
        aria-hidden
        className={cn(
          "size-3.5 transition-transform",
          isBookmarked ? "fill-current" : ""
        )}
      />
      {isBookmarked ? t("remove") : t("add")}
    </Button>
  )
}
