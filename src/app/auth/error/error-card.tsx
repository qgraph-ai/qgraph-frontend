"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { AuthCard } from "@/features/auth/components/auth-card"

export function AuthErrorCard({ errorCode }: { errorCode: string | null }) {
  const t = useTranslations("auth")
  const codeKey = errorCode ? `authError.codes.${errorCode}` : null
  const description =
    codeKey && t.has(codeKey as never)
      ? t(codeKey as never)
      : t("authError.codes.unknown")

  return (
    <AuthCard
      title={t("authError.title")}
      description={description}
      footer={
        <Button asChild className="w-full">
          <Link href="/auth/sign-in">{t("authError.backToSignIn")}</Link>
        </Button>
      }
    >
      {errorCode ? (
        <p className="text-xs text-muted-foreground">code: {errorCode}</p>
      ) : null}
    </AuthCard>
  )
}
