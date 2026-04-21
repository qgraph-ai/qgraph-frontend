"use client"

import Link from "next/link"
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
import { Input } from "@/components/ui/input"
import { AuthCard } from "@/features/auth/components/auth-card"
import { FormError } from "@/features/auth/components/form-error"
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth/schemas"
import { translateFieldError } from "@/features/auth/translate-error"
import { usePasswordResetRequest } from "@/features/auth/use-password-reset-request"

export function ForgotPasswordForm() {
  const t = useTranslations("auth")
  const tr = (message: string | undefined) =>
    translateFieldError(
      (k) => t(k as never),
      (k) => t.has(k as never),
      message
    )
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const request = usePasswordResetRequest()

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = (values: ForgotPasswordValues) => {
    setFormError(null)
    request.mutate(values, {
      onSuccess: () => setSentTo(values.email),
      // Treat any outcome as success to avoid leaking account existence.
      onError: () => setSentTo(values.email),
    })
  }

  if (sentTo) {
    return (
      <AuthCard
        title={t("forgotPassword.doneTitle")}
        description={t("forgotPassword.doneDescription", { email: sentTo })}
        guestBack={{ href: "/", label: t("common.continueAsGuest") }}
        footer={
          <Button variant="link" asChild className="px-0">
            <Link href="/auth/sign-in">
              {t("forgotPassword.backToSignIn")}
            </Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          {t("common.passwordResetAcknowledged")}
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title={t("forgotPassword.title")}
      description={t("forgotPassword.description")}
      guestBack={{ href: "/", label: t("common.continueAsGuest") }}
      footer={
        <Button variant="link" asChild className="px-0">
          <Link href="/auth/sign-in">{t("forgotPassword.backToSignIn")}</Link>
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.email")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="username"
                    inputMode="email"
                    placeholder={t("common.emailPlaceholder")}
                  />
                </FormControl>
                <FormMessage>
                  {tr(form.formState.errors.email?.message)}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={request.isPending}
            className="w-full"
          >
            {request.isPending
              ? t("common.loading")
              : t("forgotPassword.submit")}
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
