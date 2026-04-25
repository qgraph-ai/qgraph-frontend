import { getTranslations } from "next-intl/server"

import { BISMILLAH_TEXT } from "@/features/quran/lib/constants"

export async function Bismillah() {
  const t = await getTranslations("quran.reader")

  return (
    <div
      dir="rtl"
      lang="ar"
      aria-label={t("bismillahLabel")}
      className="mx-auto max-w-2xl pt-4 pb-10 text-center font-[family-name:var(--font-arabic)] text-2xl leading-[1.9] text-foreground/90 md:text-3xl md:leading-[1.9]"
    >
      {BISMILLAH_TEXT}
    </div>
  )
}
