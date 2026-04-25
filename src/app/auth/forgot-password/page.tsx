import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { ForgotPasswordForm } from "./forgot-password-form"

export async function generateMetadata() {
  const t = await getTranslations("auth.forgotPassword")
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/auth/forgot-password" },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "/auth/forgot-password",
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
    },
  } satisfies Metadata
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
