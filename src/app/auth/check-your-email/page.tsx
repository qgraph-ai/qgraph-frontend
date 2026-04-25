import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { CheckYourEmailCard } from "./check-your-email-card"

type SearchParams = Promise<{ email?: string }>

export async function generateMetadata() {
  const t = await getTranslations("auth.checkEmail")
  return {
    title: t("title"),
    description: t("descriptionNoEmail"),
    alternates: { canonical: "/auth/check-your-email" },
  } satisfies Metadata
}

export default async function CheckYourEmailPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { email } = await searchParams
  return <CheckYourEmailCard email={email ?? null} />
}
