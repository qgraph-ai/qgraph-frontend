import { getTranslations } from "next-intl/server"

export async function SiteFooter() {
  const t = await getTranslations("footer")

  return (
    <footer className="w-full border-t border-border/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6 text-xs text-muted-foreground">
        <span>{t("copyright")}</span>
        <span>{t("tagline")}</span>
      </div>
    </footer>
  )
}
