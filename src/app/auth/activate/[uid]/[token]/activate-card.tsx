"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthCard } from "@/features/auth/components/auth-card"
import { useActivate } from "@/features/auth/use-activate"

export function ActivateCard({ uid, token }: { uid: string; token: string }) {
  const t = useTranslations("auth")
  const activate = useActivate()
  const triggered = useRef(false)

  useEffect(() => {
    if (triggered.current) return
    triggered.current = true
    activate.mutate({ uid, token })
  }, [activate, uid, token])

  if (activate.isPending || activate.isIdle) {
    return (
      <AuthCard title={t("activate.pendingTitle")}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </AuthCard>
    )
  }

  if (activate.isSuccess) {
    return (
      <AuthCard
        title={t("activate.successTitle")}
        description={t("activate.successDescription")}
        footer={
          <Button asChild className="w-full">
            <Link href="/auth/sign-in">{t("activate.goToSignIn")}</Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          {t("signIn.description")}
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title={t("activate.errorTitle")}
      description={t("activate.errorDescription")}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button variant="link" asChild className="px-0">
            <Link href="/auth/sign-in">{t("activate.goToSignIn")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/sign-up">{t("activate.resend")}</Link>
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        {activate.error?.message ?? t("errors.generic")}
      </p>
    </AuthCard>
  )
}
