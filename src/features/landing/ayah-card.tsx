import { getTranslations } from "next-intl/server"

import { Separator } from "@/components/ui/separator"

export async function AyahCard() {
  const t = await getTranslations("ayah")

  return (
    <section className="w-full">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <Separator className="mx-auto mb-12 w-12 opacity-60" />
        <figure className="flex flex-col items-center gap-4 text-center">
          <blockquote
            dir="rtl"
            lang="ar"
            className="font-[family-name:var(--font-arabic)] text-3xl leading-[1.9] md:text-5xl md:leading-[1.8]"
          >
            {t("arabic")}
          </blockquote>
          <figcaption className="flex flex-col items-center gap-1 text-muted-foreground">
            <span className="text-sm md:text-base">{t("translation")}</span>
            <span className="text-xs tracking-wide opacity-80">{t("reference")}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
