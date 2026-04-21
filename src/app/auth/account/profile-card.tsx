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
import {
  updateProfileSchema,
  type UpdateProfileValues,
} from "@/features/auth/schemas"
import { translateFieldError } from "@/features/auth/translate-error"
import { useUpdateProfile } from "@/features/auth/use-update-profile"
import { applyDjoserFieldErrors } from "@/lib/api"
import type { CurrentUser } from "@/services/auth"

export function ProfileCard({ user }: { user: CurrentUser }) {
  const t = useTranslations("auth")
  const tr = (message: string | undefined) =>
    translateFieldError(
      (k) => t(k as never),
      (k) => t.has(k as never),
      message
    )
  const [formError, setFormError] = useState<string | null>(null)
  const update = useUpdateProfile()

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
    },
  })

  const onSubmit = (values: UpdateProfileValues) => {
    setFormError(null)
    update.mutate(values, {
      onSuccess: () => toast.success(t("account.profileSaved")),
      onError: (error) => {
        const mapped = applyDjoserFieldErrors(error, form.setError, [
          "first_name",
          "last_name",
        ])
        setFormError(mapped.formMessage ?? t("errors.generic"))
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.profileTitle")}</CardTitle>
        <CardDescription>{t("account.profileDescription")}</CardDescription>
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
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.firstName")}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="given-name" />
                  </FormControl>
                  <FormMessage>
                    {tr(form.formState.errors.first_name?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("common.lastName")}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="family-name" />
                  </FormControl>
                  <FormMessage>
                    {tr(form.formState.errors.last_name?.message)}
                  </FormMessage>
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending
                  ? t("common.loading")
                  : t("account.profileSubmit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
