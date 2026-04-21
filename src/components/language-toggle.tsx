"use client"

import { Languages } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { setLocale } from "@/app/actions/locale"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LOCALES, type Locale } from "@/i18n/locales"

const LABEL_KEYS = {
  en: "localeEn",
  fa: "localeFa",
} as const satisfies Record<Locale, `locale${string}`>

export function LanguageToggle({ className }: { className?: string }) {
  const current = useLocale() as Locale
  const t = useTranslations("siteHeader")
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function pick(next: string) {
    if (next === current || pending) return
    startTransition(async () => {
      await setLocale(next as Locale)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("languageMenuLabel")}
          disabled={pending}
          className={className}
        >
          <Languages className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-[--radix-dropdown-menu-trigger-width] min-w-32">
        <DropdownMenuRadioGroup value={current} onValueChange={pick}>
          {LOCALES.map((locale) => (
            <DropdownMenuRadioItem
              key={locale}
              value={locale}
              className={locale === "fa" ? "font-[family-name:var(--font-sans-fa)]" : undefined}
            >
              {t(LABEL_KEYS[locale])}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
