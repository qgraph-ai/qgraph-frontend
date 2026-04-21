"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { AuthCard } from "@/features/auth/components/auth-card"
import { FormError } from "@/features/auth/components/form-error"
import { PasswordInput } from "@/features/auth/components/password-input"
import {
  resetPasswordConfirmSchema,
  type ResetPasswordConfirmValues,
} from "@/features/auth/schemas"
import { translateFieldError } from "@/features/auth/translate-error"
import { usePasswordResetConfirm } from "@/features/auth/use-password-reset-confirm"
import { applyDjoserFieldErrors } from "@/lib/api"

export function ResetPasswordConfirmForm({
  uid,
  token,
}: {
  uid: string
  token: string
}) {
  const t = useTranslations("auth")
  const tr = (message: string | undefined) =>
    translateFieldError(
      (k) => t(k as never),
      (k) => t.has(k as never),
      message
    )
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const confirm = usePasswordResetConfirm()

  const form = useForm<ResetPasswordConfirmValues>({
    resolver: zodResolver(resetPasswordConfirmSchema),
    defaultValues: { new_password: "", re_new_password: "" },
  })

  const onSubmit = (values: ResetPasswordConfirmValues) => {
    setFormError(null)
    confirm.mutate(
      { uid, token, new_password: values.new_password },
      {
        onSuccess: () => router.replace("/auth/sign-in?reset=1"),
        onError: (error) => {
          const mapped = applyDjoserFieldErrors(error, form.setError, [
            "new_password",
          ])
          setFormError(
            mapped.formMessage ?? t("resetConfirm.errorDescription")
          )
        },
      }
    )
  }

  return (
    <AuthCard
      title={t("resetConfirm.title")}
      description={t("resetConfirm.description")}
      guestBack={{ href: "/", label: t("common.continueAsGuest") }}
      footer={
        <Button variant="link" asChild className="px-0">
          <Link href="/auth/forgot-password">
            {t("resetConfirm.requestNewLink")}
          </Link>
        </Button>
      }
    >
      <FormError message={formError} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.newPassword")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="new-password"
                    toggleAriaLabelShow={t("common.showPassword")}
                    toggleAriaLabelHide={t("common.hidePassword")}
                  />
                </FormControl>
                <FormMessage>
                  {tr(form.formState.errors.new_password?.message)}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="re_new_password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.confirmPassword")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="new-password"
                    toggleAriaLabelShow={t("common.showPassword")}
                    toggleAriaLabelHide={t("common.hidePassword")}
                  />
                </FormControl>
                <FormMessage>
                  {tr(form.formState.errors.re_new_password?.message)}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={confirm.isPending}
            className="w-full"
          >
            {confirm.isPending
              ? t("common.loading")
              : t("resetConfirm.submit")}
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
