"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthCard } from "@/features/auth/components/auth-card"
import { useAuth } from "@/features/auth/use-auth"
import type { CurrentUser } from "@/services/auth"

import { ChangeEmailCard } from "./change-email-card"
import { ChangePasswordCard } from "./change-password-card"
import { DeleteAccountCard } from "./delete-account-card"
import { ProfileCard } from "./profile-card"

const SIGN_IN_WITH_RETURN_TO = "/auth/sign-in?next=%2Fauth%2Faccount"

export function AccountPageClient({
  initialUser,
}: {
  initialUser?: CurrentUser | null
}) {
  const t = useTranslations("auth")
  const router = useRouter()
  const { status, user, error } = useAuth()
  const effectiveUser = user ?? initialUser ?? null

  useEffect(() => {
    if (
      !effectiveUser &&
      status === "unauthenticated" &&
      error?.status === 401
    ) {
      router.replace(SIGN_IN_WITH_RETURN_TO)
    }
  }, [effectiveUser, status, error?.status, router])

  if (status === "loading" && !effectiveUser) {
    return (
      <AuthCard title={t("account.title")}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </AuthCard>
    )
  }

  if (!effectiveUser && status === "unauthenticated" && error?.status === 401) {
    return (
      <AuthCard title={t("account.title")}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </AuthCard>
    )
  }

  if (!effectiveUser) {
    return (
      <AuthCard
        title={t("account.title")}
        footer={
          <Button asChild variant="link" className="px-0">
            <Link href="/auth/sign-in">{t("signIn.submit")}</Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">{t("errors.generic")}</p>
      </AuthCard>
    )
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-6 py-8">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("account.title")}
        </h1>
        <span className="text-xs text-muted-foreground">
          {t("account.signedInAs", { email: effectiveUser.email })}
        </span>
      </div>
      <ProfileCard user={effectiveUser} />
      <ChangePasswordCard />
      <ChangeEmailCard />
      <DeleteAccountCard />
    </div>
  )
}
