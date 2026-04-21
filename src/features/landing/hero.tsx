import { getTranslations } from "next-intl/server"

import { BrandOrnament } from "@/components/brand-mark"

export async function Hero() {
  const t = await getTranslations("hero")

  return (
    <section className="relative w-full overflow-hidden">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 pt-20 pb-10 text-center md:pt-28 md:pb-14">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <BrandOrnament className="size-3" />
          <span>{t("kicker")}</span>
          <BrandOrnament className="size-3" />
        </div>
        <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          {t("title")}
        </h1>
        <p className="text-balance max-w-xl text-base text-muted-foreground md:text-lg">
          {t("subtitle")}
        </p>
      </div>
    </section>
  )
}
