import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { sanitizeReturnTo } from "@/lib/navigation/sanitize-return-to"

import { SignInForm } from "./sign-in-form"

type SearchParams = Promise<{ reset?: string; next?: string }>

export async function generateMetadata() {
  const t = await getTranslations("auth.signIn")
  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/auth/sign-in" },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "/auth/sign-in",
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
    },
  } satisfies Metadata
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { reset, next } = await searchParams
  const safeNext = sanitizeReturnTo(next)
  return <SignInForm resetSuccess={Boolean(reset)} nextPath={safeNext} />
}
