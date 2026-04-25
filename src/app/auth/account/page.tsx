import { getTranslations } from "next-intl/server"

import { requireAuth } from "@/lib/auth/require-auth.server"

import { AccountPageClient } from "./account-page-client"

export async function generateMetadata() {
  const t = await getTranslations("auth.account")
  return {
    title: t("title"),
    alternates: { canonical: "/auth/account" },
  }
}

export default async function AccountPage() {
  const user = await requireAuth("/auth/account")
  return <AccountPageClient initialUser={user} />
}
