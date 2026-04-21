"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { AuthCard } from "@/features/auth/components/auth-card"

export default function AuthError({ reset }: { reset: () => void }) {
  const t = useTranslations("auth")
  return (
    <AuthCard
      title={t("errors.generic")}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button variant="ghost" onClick={reset}>
            {t("common.submit")}
          </Button>
          <Button variant="link" asChild>
            <Link href="/auth/sign-in">{t("signIn.submit")}</Link>
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">{t("errors.network")}</p>
    </AuthCard>
  )
}
