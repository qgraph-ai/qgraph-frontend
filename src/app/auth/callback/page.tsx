import { sanitizeReturnTo } from "@/lib/navigation/sanitize-return-to"

import { CallbackCard } from "./callback-card"

type SearchParams = Promise<{ error?: string; next?: string }>

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { error, next } = await searchParams
  const safeNext = sanitizeReturnTo(next)
  return <CallbackCard errorCode={error ?? null} nextPath={safeNext} />
}
