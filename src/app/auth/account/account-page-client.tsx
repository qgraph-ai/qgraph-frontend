"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthCard } from "@/features/auth/components/auth-card"
import { useAuth } from "@/features/auth/use-auth"

import { ChangeEmailCard } from "./change-email-card"
import { ChangePasswordCard } from "./change-password-card"
import { DeleteAccountCard } from "./delete-account-card"
import { ProfileCard } from "./profile-card"

export function AccountPageClient() {
  const t = useTranslations("auth")
  const router = useRouter()
  const { status, user } = useAuth()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/sign-in?next=/auth/account")
    }
  }, [router, status])

  if (status === "loading") {
    return (
      <AuthCard title={t("account.title")}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </AuthCard>
    )
  }

  if (status !== "authenticated" || !user) {
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
          {t("account.signedInAs", { email: user.email })}
        </span>
      </div>
      <ProfileCard user={user} />
      <ChangePasswordCard />
      <ChangeEmailCard />
      <DeleteAccountCard />
    </div>
  )
}
