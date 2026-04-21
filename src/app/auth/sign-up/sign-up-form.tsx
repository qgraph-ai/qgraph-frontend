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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AuthCard } from "@/features/auth/components/auth-card"
import { FormError } from "@/features/auth/components/form-error"
import { GoogleLoginButton } from "@/features/auth/components/google-login-button"
import { PasswordInput } from "@/features/auth/components/password-input"
import { signUpSchema, type SignUpValues } from "@/features/auth/schemas"
import { translateFieldError } from "@/features/auth/translate-error"
import { useRegister } from "@/features/auth/use-register"
import { applyDjoserFieldErrors } from "@/lib/api"

export function SignUpForm() {
  const t = useTranslations("auth")
  const tr = (message: string | undefined) =>
    translateFieldError(
      (k) => t(k as never),
      (k) => t.has(k as never),
      message
    )
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const register = useRegister()

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", re_password: "" },
  })

  const onSubmit = (values: SignUpValues) => {
    setFormError(null)
    register.mutate(values, {
      onSuccess: () => {
        const params = new URLSearchParams({ email: values.email })
        router.push(`/auth/check-your-email?${params.toString()}`)
      },
      onError: (error) => {
        const mapped = applyDjoserFieldErrors(error, form.setError, [
          "email",
          "password",
          "re_password",
        ])
        setFormError(mapped.formMessage ?? t("errors.generic"))
      },
    })
  }

  return (
    <AuthCard
      title={t("signUp.title")}
      description={t("signUp.description")}
      guestBack={{ href: "/", label: t("common.continueAsGuest") }}
      footer={
        <div className="flex w-full flex-col gap-2 text-sm text-muted-foreground">
          <p>{t("signUp.termsHint")}</p>
          <p>
            {t("signUp.haveAccount")}{" "}
            <Link
              href="/auth/sign-in"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {t("signUp.signIn")}
            </Link>
          </p>
        </div>
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
                <FormMessage>{tr(form.formState.errors.email?.message)}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.password")}</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="new-password"
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
          <FormField
            control={form.control}
            name="re_password"
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
                  {tr(form.formState.errors.re_password?.message)}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={register.isPending}
            className="w-full"
          >
            {register.isPending ? t("common.loading") : t("signUp.submit")}
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

      <GoogleLoginButton label={t("signUp.google")} />
    </AuthCard>
  )
}
