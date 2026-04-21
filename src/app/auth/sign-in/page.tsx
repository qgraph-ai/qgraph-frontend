import { getTranslations } from "next-intl/server"

import { SignInForm } from "./sign-in-form"

type SearchParams = Promise<{ reset?: string; next?: string }>

export async function generateMetadata() {
  const t = await getTranslations("auth.signIn")
  return { title: t("title") }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { reset, next } = await searchParams
  return <SignInForm resetSuccess={Boolean(reset)} nextPath={next ?? null} />
}
