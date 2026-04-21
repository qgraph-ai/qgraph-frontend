export type CurrentUser = {
  id: number
  email: string
  first_name?: string
  last_name?: string
}

export type RegisterPayload = {
  email: string
  password: string
  re_password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type ActivationPayload = {
  uid: string
  token: string
}

export type ResendActivationPayload = {
  email: string
}

export type ResetPasswordPayload = {
  email: string
}

export type ResetPasswordConfirmPayload = {
  uid: string
  token: string
  new_password: string
}

export type SetPasswordPayload = {
  current_password: string
  new_password: string
}

export type SetEmailPayload = {
  current_password: string
  new_email: string
}

export type ConfirmEmailChangePayload = {
  uid: string
  token: string
  new_email: string
}

export type UpdateProfilePayload = {
  first_name?: string
  last_name?: string
}
