import { CallbackCard } from "./callback-card"

type SearchParams = Promise<{ error?: string; next?: string }>

export default async function CallbackPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { error, next } = await searchParams
  return <CallbackCard errorCode={error ?? null} nextPath={next ?? null} />
}
