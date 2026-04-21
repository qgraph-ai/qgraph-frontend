import { AuthErrorCard } from "./error-card"

type SearchParams = Promise<{ error?: string }>

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { error } = await searchParams
  return <AuthErrorCard errorCode={error ?? null} />
}
