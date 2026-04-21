"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"

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
import { Separator } from "@/components/ui/separator"
import { AuthCard } from "@/features/auth/components/auth-card"
import { FormError } from "@/features/auth/components/form-error"
import { GoogleLoginButton } from "@/features/auth/components/google-login-button"
import { PasswordInput } from "@/features/auth/components/password-input"
import { signInSchema, type SignInValues } from "@/features/auth/schemas"
import { translateFieldError } from "@/features/auth/translate-error"
import { useLogin } from "@/features/auth/use-login"
import { useResendActivation } from "@/features/auth/use-resend-activation"
import { applyDjoserFieldErrors } from "@/lib/api"

export function SignInForm({
  resetSuccess,
  nextPath,
}: {
  resetSuccess: boolean
  nextPath: string | null
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
  const [inactiveEmail, setInactiveEmail] = useState<string | null>(null)

  const login = useLogin()
  const resend = useResendActivation()

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (values: SignInValues) => {
    setFormError(null)
    setInactiveEmail(null)
    login.mutate(values, {
      onSuccess: () => {
        router.replace(nextPath ?? "/")
        router.refresh()
      },
      onError: (error) => {
        const mapped = applyDjoserFieldErrors(error, form.setError, [
          "email",
          "password",
        ])
        if (error.status === 401) {
          setInactiveEmail(values.email)
          setFormError(t("signIn.invalidCredentials"))
          return
        }
        setFormError(mapped.formMessage ?? t("errors.generic"))
      },
    })
  }

  const onResend = () => {
    if (!inactiveEmail) return
    resend.mutate(
      { email: inactiveEmail },
      {
        onSuccess: () => toast.success(t("checkEmail.resent")),
        onError: () => toast.error(t("errors.generic")),
      }
    )
  }

  return (
    <AuthCard
      title={t("signIn.title")}
      description={t("signIn.description")}
      guestBack={{
        href: nextPath ?? "/",
        label: t("common.continueAsGuest"),
      }}
      footer={
        <p className="text-sm text-muted-foreground">
          {t("signIn.noAccount")}{" "}
          <Link
            href="/auth/sign-up"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t("signIn.createAccount")}
          </Link>
        </p>
      }
    >
      {resetSuccess ? (
        <p
          className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-foreground"
          role="status"
        >
          {t("signIn.resetSuccessBanner")}
        </p>
      ) : null}

      <FormError message={formError} />
      {inactiveEmail ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={onResend}
            disabled={resend.isPending}
          >
            {t("signIn.resendActivation")}
          </Button>
        </div>
      ) : null}

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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t("common.password")}</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {t("signIn.forgotPassword")}
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="current-password"
                    toggleAriaLabelShow={t("common.showPassword")}
                    toggleAriaLabelHide={t("common.hidePassword")}
                  />
                </FormControl>
                <FormMessage>
                  {tr(form.formState.errors.password?.message)}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button type="submit" disabled={login.isPending} className="w-full">
            {login.isPending ? t("common.loading") : t("signIn.submit")}
          </Button>
        </form>
      </Form>

      <div className="relative flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase text-muted-foreground">
          {t("common.or")}
        </span>
        <Separator className="flex-1" />
      </div>

      <GoogleLoginButton label={t("signIn.google")} />
    </AuthCard>
  )
}
