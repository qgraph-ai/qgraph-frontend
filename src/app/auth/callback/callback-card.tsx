"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthCard } from "@/features/auth/components/auth-card"
import { useAuth } from "@/features/auth/use-auth"

export function CallbackCard({
  errorCode,
  nextPath,
}: {
  errorCode: string | null
  nextPath: string | null
}) {
  const t = useTranslations("auth")
  const router = useRouter()
  const { status, refetch } = useAuth()

  useEffect(() => {
    if (errorCode) return
    refetch()
  }, [errorCode, refetch])

  useEffect(() => {
    if (errorCode) return
    if (status === "authenticated") {
      router.replace(nextPath ?? "/")
      router.refresh()
    }
  }, [errorCode, nextPath, router, status])

  if (errorCode) {
    return (
      <AuthCard
        title={t("callback.errorTitle")}
        description={t("callback.errorDescription")}
        footer={
          <Button asChild className="w-full">
            <Link href="/auth/sign-in">{t("callback.retry")}</Link>
          </Button>
        }
      >
        <p className="text-xs text-muted-foreground">code: {errorCode}</p>
      </AuthCard>
    )
  }

  return (
    <AuthCard title={t("callback.pendingTitle")}>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-3/4" />
    </AuthCard>
  )
}
