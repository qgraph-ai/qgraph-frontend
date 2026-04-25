import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { SignUpForm } from "./sign-up-form"

export async function generateMetadata() {
  const t = await getTranslations("auth.signUp")
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/auth/sign-up" },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "/auth/sign-up",
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
    },
  } satisfies Metadata
}

export default function SignUpPage() {
  return <SignUpForm />
}
