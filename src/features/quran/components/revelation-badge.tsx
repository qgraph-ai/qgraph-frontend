import { getTranslations } from "next-intl/server"

import type { RevelationPlace } from "@/services/quran"

export async function RevelationBadge({ place }: { place: RevelationPlace }) {
  const t = await getTranslations("quran.reader")
  const label = place === "meccan" ? t("meccan") : t("medinan")
  return (
    <span className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
      {label}
    </span>
  )
}
