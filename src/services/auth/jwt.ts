import { apiClient } from "@/lib/api"

import { AUTH_PATHS } from "./paths"
import type { CurrentUser, LoginPayload } from "./types"

export async function login(payload: LoginPayload): Promise<CurrentUser> {
  console.info(
    `[auth-debug] service.login: calling POST ${AUTH_PATHS.jwtCreate} with email='${payload.email}' (password redacted). Expecting 200 + CurrentUser body + Set-Cookie: qgraph_access_token / qgraph_refresh_token.`
  )
  try {
    const res = await apiClient.post<CurrentUser>(AUTH_PATHS.jwtCreate, payload)
    console.info(
      `[auth-debug] service.login: SUCCESS status=${res.status} user.id=${res.data?.id} user.email='${res.data?.email}'`
    )
    return res.data
  } catch (err) {
    console.warn("[auth-debug] service.login: FAILED", err)
    throw err
  }
}

export async function logout(): Promise<void> {
  console.info(
    `[auth-debug] service.logout: calling POST ${AUTH_PATHS.jwtLogout}. Expecting 204 + cleared access/refresh cookies.`
  )
  try {
    await apiClient.post(AUTH_PATHS.jwtLogout)
    console.info("[auth-debug] service.logout: SUCCESS")
  } catch (err) {
    console.warn("[auth-debug] service.logout: FAILED", err)
    throw err
  }
}
