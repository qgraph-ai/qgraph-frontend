import { ActivateCard } from "./activate-card"

type Params = Promise<{ uid: string; token: string }>

export default async function ActivatePage({ params }: { params: Params }) {
  const { uid, token } = await params
  return <ActivateCard uid={uid} token={token} />
}
