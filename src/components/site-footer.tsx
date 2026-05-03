import { getTranslations } from "next-intl/server"
import Link from "next/link"

export async function SiteFooter() {
  const t = await getTranslations("footer")

  return (
    <footer className="w-full border-t border-border/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6 text-xs text-muted-foreground">
        <span>{t("copyright")}</span>
        <Link
          href="/references"
          className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t("references")}
        </Link>
        <span>{t("tagline")}</span>
      </div>
    </footer>
  )
}
