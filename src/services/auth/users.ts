import { apiClient } from "@/lib/api"

import { AUTH_PATHS } from "./paths"
import type {
  ActivationPayload,
  ConfirmEmailChangePayload,
  CurrentUser,
  RegisterPayload,
  ResendActivationPayload,
  ResetPasswordConfirmPayload,
  ResetPasswordPayload,
  SetEmailPayload,
  SetPasswordPayload,
  UpdateProfilePayload,
} from "./types"

export async function registerUser(
  payload: RegisterPayload
): Promise<CurrentUser> {
  console.info(
    `[auth-debug] service.registerUser: calling POST ${AUTH_PATHS.register} with email='${payload.email}' (passwords redacted). Expecting 201 + CurrentUser body + activation email sent.`
  )
  try {
    const res = await apiClient.post<CurrentUser>(AUTH_PATHS.register, payload)
    console.info(
      `[auth-debug] service.registerUser: SUCCESS status=${res.status} user.id=${res.data?.id} user.email='${res.data?.email}'`
    )
    return res.data
  } catch (err) {
    console.warn("[auth-debug] service.registerUser: FAILED", err)
    throw err
  }
}

export async function activateUser(payload: ActivationPayload): Promise<void> {
  console.info(
    `[auth-debug] service.activateUser: calling POST ${AUTH_PATHS.activate} with uid='${payload.uid}' tokenLen=${payload.token?.length ?? 0}. Expecting 204.`
  )
  try {
    await apiClient.post(AUTH_PATHS.activate, payload)
    console.info("[auth-debug] service.activateUser: SUCCESS")
  } catch (err) {
    console.warn("[auth-debug] service.activateUser: FAILED", err)
    throw err
  }
}

export async function resendActivation(
  payload: ResendActivationPayload
): Promise<void> {
  console.info(
    `[auth-debug] service.resendActivation: calling POST ${AUTH_PATHS.resendActivation} with email='${payload.email}'. Expecting 204 (never reveals account existence).`
  )
  try {
    await apiClient.post(AUTH_PATHS.resendActivation, payload)
    console.info("[auth-debug] service.resendActivation: SUCCESS")
  } catch (err) {
    console.warn("[auth-debug] service.resendActivation: FAILED", err)
    throw err
  }
}

export async function requestPasswordReset(
  payload: ResetPasswordPayload
): Promise<void> {
  console.info(
    `[auth-debug] service.requestPasswordReset: calling POST ${AUTH_PATHS.resetPassword} with email='${payload.email}'. Expecting 204.`
  )
  try {
    await apiClient.post(AUTH_PATHS.resetPassword, payload)
    console.info("[auth-debug] service.requestPasswordReset: SUCCESS")
  } catch (err) {
    console.warn("[auth-debug] service.requestPasswordReset: FAILED", err)
    throw err
  }
}

export async function confirmPasswordReset(
  payload: ResetPasswordConfirmPayload
): Promise<void> {
  console.info(
    `[auth-debug] service.confirmPasswordReset: calling POST ${AUTH_PATHS.resetPasswordConfirm} with uid='${payload.uid}' tokenLen=${payload.token?.length ?? 0} (new_password redacted). Expecting 204.`
  )
  try {
    await apiClient.post(AUTH_PATHS.resetPasswordConfirm, payload)
    console.info("[auth-debug] service.confirmPasswordReset: SUCCESS")
  } catch (err) {
    console.warn("[auth-debug] service.confirmPasswordReset: FAILED", err)
    throw err
  }
}

export async function getCurrentUser(): Promise<CurrentUser> {
  console.info(
    `[auth-debug] service.getCurrentUser: calling GET ${AUTH_PATHS.me}. Expecting 200 + CurrentUser body if session cookie valid, else 401.`
  )
  try {
    const res = await apiClient.get<CurrentUser>(AUTH_PATHS.me)
    console.info(
      `[auth-debug] service.getCurrentUser: SUCCESS status=${res.status} user.id=${res.data?.id} user.email='${res.data?.email}'`
    )
    return res.data
  } catch (err) {
    console.warn("[auth-debug] service.getCurrentUser: FAILED", err)
    throw err
  }
}

export async function updateCurrentUser(
  payload: UpdateProfilePayload
): Promise<CurrentUser> {
  console.info(
    `[auth-debug] service.updateCurrentUser: calling PATCH ${AUTH_PATHS.me} with keys=[${Object.keys(payload).join(",")}]. Expecting 200 + updated CurrentUser.`
  )
  try {
    const res = await apiClient.patch<CurrentUser>(AUTH_PATHS.me, payload)
    console.info(
      `[auth-debug] service.updateCurrentUser: SUCCESS status=${res.status} user.id=${res.data?.id}`
    )
    return res.data
  } catch (err) {
    console.warn("[auth-debug] service.updateCurrentUser: FAILED", err)
    throw err
  }
}

export async function deleteCurrentUser(): Promise<void> {
  console.info(
    `[auth-debug] service.deleteCurrentUser: calling DELETE ${AUTH_PATHS.me}. Expecting 204 + cleared auth cookies.`
  )
  try {
    await apiClient.delete(AUTH_PATHS.me)
    console.info("[auth-debug] service.deleteCurrentUser: SUCCESS")
  } catch (err) {
    console.warn("[auth-debug] service.deleteCurrentUser: FAILED", err)
    throw err
  }
}

export async function setPassword(payload: SetPasswordPayload): Promise<void> {
  console.info(
    `[auth-debug] service.setPassword: calling POST ${AUTH_PATHS.setPassword} (current+new passwords redacted). Expecting 204.`
  )
  try {
    await apiClient.post(AUTH_PATHS.setPassword, payload)
    console.info("[auth-debug] service.setPassword: SUCCESS")
  } catch (err) {
    console.warn("[auth-debug] service.setPassword: FAILED", err)
    throw err
  }
}

export async function setEmail(payload: SetEmailPayload): Promise<void> {
  console.info(
    `[auth-debug] service.setEmail: calling POST ${AUTH_PATHS.setEmail} with new_email='${payload.new_email}' (password redacted). Expecting 204 + confirm email sent.`
  )
  try {
    await apiClient.post(AUTH_PATHS.setEmail, payload)
    console.info("[auth-debug] service.setEmail: SUCCESS")
  } catch (err) {
    console.warn("[auth-debug] service.setEmail: FAILED", err)
    throw err
  }
}

export async function confirmEmailChange(
  payload: ConfirmEmailChangePayload
): Promise<void> {
  console.info(
    `[auth-debug] service.confirmEmailChange: calling POST ${AUTH_PATHS.resetEmailConfirm} with uid='${payload.uid}' tokenLen=${payload.token?.length ?? 0} new_email='${payload.new_email}'. Expecting 204.`
  )
  try {
    await apiClient.post(AUTH_PATHS.resetEmailConfirm, payload)
    console.info("[auth-debug] service.confirmEmailChange: SUCCESS")
  } catch (err) {
    console.warn("[auth-debug] service.confirmEmailChange: FAILED", err)
    throw err
  }
}
