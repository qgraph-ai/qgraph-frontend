import "server-only"

import { cookies } from "next/headers"

import { API_URL } from "@/lib/env"
import { AUTH_PATHS } from "@/services/auth/paths"
import type { CurrentUser } from "@/services/auth/types"

export async function getServerSession(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  if (!cookieHeader) return null

  try {
    const response = await fetch(`${API_URL}${AUTH_PATHS.me}`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    })
    if (!response.ok) return null
    return (await response.json()) as CurrentUser
  } catch {
    return null
  }
}
