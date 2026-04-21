"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
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
import { Skeleton } from "@/components/ui/skeleton"
import { AuthCard } from "@/features/auth/components/auth-card"
import { FormError } from "@/features/auth/components/form-error"
import {
  confirmEmailChangeSchema,
  type ConfirmEmailChangeValues,
} from "@/features/auth/schemas"
import { translateFieldError } from "@/features/auth/translate-error"
import { useConfirmEmailChange } from "@/features/auth/use-confirm-email-change"
import { applyDjoserFieldErrors } from "@/lib/api"

export function ConfirmEmailChangeCard({
  uid,
  token,
  initialEmail,
}: {
  uid: string
  token: string
  initialEmail: string
}) {
  const t = useTranslations("auth")
  const tr = (message: string | undefined) =>
    translateFieldError(
      (k) => t(k as never),
      (k) => t.has(k as never),
      message
    )
  const confirm = useConfirmEmailChange()
  const autoTriggered = useRef(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<ConfirmEmailChangeValues>({
    resolver: zodResolver(confirmEmailChangeSchema),
    defaultValues: { new_email: initialEmail },
  })

  useEffect(() => {
    if (!initialEmail) return
    if (autoTriggered.current) return
    autoTriggered.current = true
    confirm.mutate({ uid, token, new_email: initialEmail })
  }, [confirm, uid, token, initialEmail])

  const onSubmit = (values: ConfirmEmailChangeValues) => {
    setFormError(null)
    confirm.mutate(
      { uid, token, new_email: values.new_email },
      {
        onError: (error) => {
          const mapped = applyDjoserFieldErrors(error, form.setError, [
            "new_email",
          ])
          setFormError(mapped.formMessage ?? t("errors.generic"))
        },
      }
    )
  }

  if (confirm.isSuccess) {
    return (
      <AuthCard
        title={t("emailConfirm.successTitle")}
        description={t("emailConfirm.successDescription")}
        footer={
          <Button asChild className="w-full">
            <Link href="/auth/account">{t("emailConfirm.continue")}</Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          {t("account.emailChangeRequested")}
        </p>
      </AuthCard>
    )
  }

  if (initialEmail && confirm.isPending) {
    return (
      <AuthCard title={t("emailConfirm.pendingTitle")}>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </AuthCard>
    )
  }

  if (initialEmail && confirm.isError) {
    return (
      <AuthCard
        title={t("emailConfirm.errorTitle")}
        description={t("emailConfirm.errorDescription")}
        footer={
          <Button variant="outline" asChild className="w-full">
            <Link href="/auth/account">{t("emailConfirm.continue")}</Link>
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          {confirm.error?.message ?? t("errors.generic")}
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title={t("emailConfirm.pendingTitle")}
      description={t("account.changeEmailDescription")}
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
          <Button type="submit" disabled={confirm.isPending}>
            {confirm.isPending
              ? t("common.loading")
              : t("emailConfirm.continue")}
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
