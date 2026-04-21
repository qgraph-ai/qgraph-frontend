export const AUTH_PATHS = {
  csrf: "/api/auth/csrf/",
  register: "/api/auth/users/",
  activate: "/api/auth/users/activation/",
  resendActivation: "/api/auth/users/resend_activation/",
  resetPassword: "/api/auth/users/reset_password/",
  resetPasswordConfirm: "/api/auth/users/reset_password_confirm/",
  setPassword: "/api/auth/users/set_password/",
  setEmail: "/api/auth/users/set_email/",
  resetEmailConfirm: "/api/auth/users/reset_email_confirm/",
  me: "/api/auth/users/me/",
  jwtCreate: "/api/auth/jwt/create/",
  jwtRefresh: "/api/auth/jwt/refresh/",
  jwtLogout: "/api/auth/jwt/logout/",
  googleLogin: "/api/auth/google/login/",
} as const

export type AuthPath = (typeof AUTH_PATHS)[keyof typeof AUTH_PATHS]
