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
  const res = await apiClient.post<CurrentUser>(AUTH_PATHS.register, payload)
  return res.data
}

export async function activateUser(payload: ActivationPayload): Promise<void> {
  await apiClient.post(AUTH_PATHS.activate, payload)
}

export async function resendActivation(
  payload: ResendActivationPayload
): Promise<void> {
  await apiClient.post(AUTH_PATHS.resendActivation, payload)
}

export async function requestPasswordReset(
  payload: ResetPasswordPayload
): Promise<void> {
  await apiClient.post(AUTH_PATHS.resetPassword, payload)
}

export async function confirmPasswordReset(
  payload: ResetPasswordConfirmPayload
): Promise<void> {
  await apiClient.post(AUTH_PATHS.resetPasswordConfirm, payload)
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const res = await apiClient.get<CurrentUser>(AUTH_PATHS.me)
  return res.data
}

export async function updateCurrentUser(
  payload: UpdateProfilePayload
): Promise<CurrentUser> {
  const res = await apiClient.patch<CurrentUser>(AUTH_PATHS.me, payload)
  return res.data
}

export async function deleteCurrentUser(): Promise<void> {
  await apiClient.delete(AUTH_PATHS.me)
}

export async function setPassword(payload: SetPasswordPayload): Promise<void> {
  await apiClient.post(AUTH_PATHS.setPassword, payload)
}

export async function setEmail(payload: SetEmailPayload): Promise<void> {
  await apiClient.post(AUTH_PATHS.setEmail, payload)
}

export async function confirmEmailChange(
  payload: ConfirmEmailChangePayload
): Promise<void> {
  await apiClient.post(AUTH_PATHS.resetEmailConfirm, payload)
}

