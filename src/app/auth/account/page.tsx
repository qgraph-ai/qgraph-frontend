import { getTranslations } from "next-intl/server"

import { AccountPageClient } from "./account-page-client"

export async function generateMetadata() {
  const t = await getTranslations("auth.account")
  return { title: t("title") }
}

export default function AccountPage() {
  return <AccountPageClient />
}
