import { ResetPasswordConfirmForm } from "./reset-password-confirm-form"

type Params = Promise<{ uid: string; token: string }>

export default async function ResetPasswordConfirmPage({
  params,
}: {
  params: Params
}) {
  const { uid, token } = await params
  return <ResetPasswordConfirmForm uid={uid} token={token} />
}
