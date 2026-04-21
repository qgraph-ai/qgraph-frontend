"use client"

import { LogOut, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import toast from "react-hot-toast"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/features/auth/use-auth"
import { useLogout } from "@/features/auth/use-logout"

function initialsFor(email: string, firstName?: string | null, lastName?: string | null) {
  if (firstName || lastName) {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || email[0]?.toUpperCase() || "?"
  }
  return email[0]?.toUpperCase() ?? "?"
}

export function UserMenu() {
  const t = useTranslations("siteHeader")
  const tAuth = useTranslations("auth")
  const router = useRouter()
  const { status, user } = useAuth()
  const logout = useLogout()

  if (status === "loading") {
    return <Skeleton className="h-8 w-20" />
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="flex items-center gap-1">
        <Button asChild variant="ghost" size="sm">
          <Link href="/auth/sign-in">{t("signIn")}</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/auth/sign-up">{t("signUp")}</Link>
        </Button>
      </div>
    )
  }

  const onSignOut = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        toast.success(tAuth("account.signedOut"))
        router.replace("/")
        router.refresh()
      },
      onError: () => toast.error(tAuth("errors.generic")),
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("account")}
          className="rounded-full"
        >
          <Avatar size="sm">
            <AvatarFallback>
              {initialsFor(user.email, user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="min-w-56">
        <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/auth/account">
            <User aria-hidden />
            {t("account")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            onSignOut()
          }}
          disabled={logout.isPending}
        >
          <LogOut aria-hidden />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
