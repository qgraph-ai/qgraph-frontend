import { apiClient } from "@/lib/api"

import { AUTH_PATHS } from "./paths"
import type { CurrentUser, LoginPayload } from "./types"

export async function login(payload: LoginPayload): Promise<CurrentUser> {
  const res = await apiClient.post<CurrentUser>(AUTH_PATHS.jwtCreate, payload)
  return res.data
}

export async function logout(): Promise<void> {
  await apiClient.post(AUTH_PATHS.jwtLogout)
}

