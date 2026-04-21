"use client"

import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { FormError } from "@/features/auth/components/form-error"
import { PasswordInput } from "@/features/auth/components/password-input"
import {
  setPasswordSchema,
  type SetPasswordValues,
} from "@/features/auth/schemas"
import { translateFieldError } from "@/features/auth/translate-error"
import { useSetPassword } from "@/features/auth/use-set-password"
import { applyDjoserFieldErrors } from "@/lib/api"

export function ChangePasswordCard() {
  const t = useTranslations("auth")
  const tr = (message: string | undefined) =>
    translateFieldError(
      (k) => t(k as never),
      (k) => t.has(k as never),
      message
    )
  const [formError, setFormError] = useState<string | null>(null)
  const setPassword = useSetPassword()

  const form = useForm<SetPasswordValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      re_new_password: "",
    },
  })

  const onSubmit = (values: SetPasswordValues) => {
    setFormError(null)
    setPassword.mutate(
      {
        current_password: values.current_password,
        new_password: values.new_password,
      },
      {
        onSuccess: () => {
          toast.success(t("account.passwordChanged"))
          form.reset()
        },
        onError: (error) => {
          const mapped = applyDjoserFieldErrors(error, form.setError, [
            "current_password",
            "new_password",
          ])
          setFormError(mapped.formMessage ?? t("errors.generic"))
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.changePasswordTitle")}</CardTitle>
        <CardDescription>
          {t("account.changePasswordDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormError message={formError} />
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.currentPassword")}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      autoComplete="current-password"
                      toggleAriaLabelShow={t("common.showPassword")}
                      toggleAriaLabelHide={t("common.hidePassword")}
                    />
                  </FormControl>
                  <FormMessage>
                    {tr(form.formState.errors.current_password?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />
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
            <div className="flex justify-end">
              <Button type="submit" disabled={setPassword.isPending}>
                {setPassword.isPending
                  ? t("common.loading")
                  : t("account.changePasswordSubmit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
