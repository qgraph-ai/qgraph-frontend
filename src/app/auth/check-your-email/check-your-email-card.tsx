"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { AuthCard } from "@/features/auth/components/auth-card"
import { useResendActivation } from "@/features/auth/use-resend-activation"

export function CheckYourEmailCard({ email }: { email: string | null }) {
  const t = useTranslations("auth")
  const resend = useResendActivation()

  const onResend = () => {
    if (!email) return
    resend.mutate(
      { email },
      {
        onSuccess: () => toast.success(t("checkEmail.resent")),
        onError: () => toast.error(t("errors.generic")),
      }
    )
  }

  return (
    <AuthCard
      title={t("checkEmail.title")}
      description={
        email
          ? t("checkEmail.description", { email })
          : t("checkEmail.descriptionNoEmail")
      }
      guestBack={{ href: "/", label: t("common.continueAsGuest") }}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button variant="link" asChild className="px-0">
            <Link href="/auth/sign-in">{t("checkEmail.backToSignIn")}</Link>
          </Button>
          {email ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onResend}
              disabled={resend.isPending}
            >
              {t("checkEmail.resend")}
            </Button>
          ) : null}
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        {t("signUp.termsHint")}
      </p>
    </AuthCard>
  )
}
