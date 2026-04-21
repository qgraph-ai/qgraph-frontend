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
import { Input } from "@/components/ui/input"
import { FormError } from "@/features/auth/components/form-error"
import { PasswordInput } from "@/features/auth/components/password-input"
import { setEmailSchema, type SetEmailValues } from "@/features/auth/schemas"
import { translateFieldError } from "@/features/auth/translate-error"
import { useSetEmail } from "@/features/auth/use-set-email"
import { applyDjoserFieldErrors } from "@/lib/api"

export function ChangeEmailCard() {
  const t = useTranslations("auth")
  const tr = (message: string | undefined) =>
    translateFieldError(
      (k) => t(k as never),
      (k) => t.has(k as never),
      message
    )
  const [formError, setFormError] = useState<string | null>(null)
  const setEmail = useSetEmail()

  const form = useForm<SetEmailValues>({
    resolver: zodResolver(setEmailSchema),
    defaultValues: { current_password: "", new_email: "" },
  })

  const onSubmit = (values: SetEmailValues) => {
    setFormError(null)
    setEmail.mutate(values, {
      onSuccess: () => {
        toast.success(t("account.emailChangeRequested"))
        form.reset()
      },
      onError: (error) => {
        const mapped = applyDjoserFieldErrors(error, form.setError, [
          "current_password",
          "new_email",
        ])
        setFormError(mapped.formMessage ?? t("errors.generic"))
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.changeEmailTitle")}</CardTitle>
        <CardDescription>
          {t("account.changeEmailDescription")}
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
              name="new_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.email")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder={t("common.emailPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage>
                    {tr(form.formState.errors.new_email?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />
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
            <div className="flex justify-end">
              <Button type="submit" disabled={setEmail.isPending}>
                {setEmail.isPending
                  ? t("common.loading")
                  : t("account.changeEmailSubmit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
