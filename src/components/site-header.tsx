import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Toolbar, VisuallyHidden } from "radix-ui"

import { BrandOrnament, BrandWordmark } from "@/components/brand-mark"
import { LanguageToggle } from "@/components/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"

export async function SiteHeader() {
  const t = await getTranslations("siteHeader")

  return (
    <header className="w-full border-b border-border/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <BrandOrnament className="size-4 text-muted-foreground" />
          <BrandWordmark />
          <VisuallyHidden.Root>{t("brand")}</VisuallyHidden.Root>
        </Link>
        <Toolbar.Root
          aria-label={t("headerToolbarLabel")}
          className="flex items-center gap-2"
        >
          <LanguageToggle />
          <ThemeToggle />
          <Toolbar.Separator className="mx-1 h-4 w-px bg-border" />
          <UserMenu />
        </Toolbar.Root>
      </div>
    </header>
  )
}
