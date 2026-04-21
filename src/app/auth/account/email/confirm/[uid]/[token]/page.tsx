import { ConfirmEmailChangeCard } from "./confirm-email-change-card"

type Params = Promise<{ uid: string; token: string }>
type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ConfirmEmailChangePage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: SearchParams
}) {
  const { uid, token } = await params
  const sp = await searchParams
  const rawEmail = sp.new_email ?? sp.email
  const initialEmail = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail
  return (
    <ConfirmEmailChangeCard
      uid={uid}
      token={token}
      initialEmail={initialEmail ?? ""}
    />
  )
}
