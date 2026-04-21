import { z } from "zod"

const email = z.string().trim().min(1, "validation.emailRequired").email(
  "validation.emailInvalid"
)

const password = z
  .string()
  .min(8, "validation.passwordMin")
  .max(128, "validation.passwordMax")

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "validation.passwordRequired"),
})
export type SignInValues = z.infer<typeof signInSchema>

export const signUpSchema = z
  .object({
    email,
    password,
    re_password: z.string().min(1, "validation.passwordRequired"),
  })
  .refine((data) => data.password === data.re_password, {
    message: "validation.passwordsMustMatch",
    path: ["re_password"],
  })
export type SignUpValues = z.infer<typeof signUpSchema>

export const forgotPasswordSchema = z.object({ email })
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export const resendActivationSchema = z.object({ email })
export type ResendActivationValues = z.infer<typeof resendActivationSchema>

export const resetPasswordConfirmSchema = z
  .object({
    new_password: password,
    re_new_password: z.string().min(1, "validation.passwordRequired"),
  })
  .refine((data) => data.new_password === data.re_new_password, {
    message: "validation.passwordsMustMatch",
    path: ["re_new_password"],
  })
export type ResetPasswordConfirmValues = z.infer<
  typeof resetPasswordConfirmSchema
>

export const setPasswordSchema = z
  .object({
    current_password: z.string().min(1, "validation.passwordRequired"),
    new_password: password,
    re_new_password: z.string().min(1, "validation.passwordRequired"),
  })
  .refine((data) => data.new_password === data.re_new_password, {
    message: "validation.passwordsMustMatch",
    path: ["re_new_password"],
  })
export type SetPasswordValues = z.infer<typeof setPasswordSchema>

export const setEmailSchema = z.object({
  current_password: z.string().min(1, "validation.passwordRequired"),
  new_email: email,
})
export type SetEmailValues = z.infer<typeof setEmailSchema>

export const confirmEmailChangeSchema = z.object({
  new_email: email,
})
export type ConfirmEmailChangeValues = z.infer<typeof confirmEmailChangeSchema>

export const updateProfileSchema = z.object({
  first_name: z.string().trim().max(150, "validation.nameMax").optional(),
  last_name: z.string().trim().max(150, "validation.nameMax").optional(),
})
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>
