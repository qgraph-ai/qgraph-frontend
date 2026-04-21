import "server-only"

import { redirect } from "next/navigation"

import { getServerSession } from "./session.server"

export async function requireAuth(returnTo?: string) {
  const user = await getServerSession()
  if (!user) {
    const suffix = returnTo ? `?next=${encodeURIComponent(returnTo)}` : ""
    redirect(`/auth/sign-in${suffix}`)
  }
  return user
}
