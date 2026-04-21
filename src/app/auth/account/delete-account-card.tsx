"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import toast from "react-hot-toast"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useDeleteAccount } from "@/features/auth/use-delete-account"

export function DeleteAccountCard() {
  const t = useTranslations("auth")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const remove = useDeleteAccount()

  const onConfirm = () => {
    remove.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("account.signedOut"))
        setOpen(false)
        router.replace("/")
        router.refresh()
      },
      onError: () => toast.error(t("errors.generic")),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-destructive">
          {t("account.deleteAccountTitle")}
        </CardTitle>
        <CardDescription>
          {t("account.deleteAccountDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end">
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                {t("account.deleteAccountSubmit")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("account.deleteAccountConfirmTitle")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t("account.deleteAccountConfirmDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t("account.deleteAccountCancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onConfirm}
                  disabled={remove.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t("account.deleteAccountConfirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
