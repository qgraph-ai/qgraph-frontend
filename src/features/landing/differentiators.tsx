import { Layers, ScanLine, UnlockKeyhole } from "lucide-react"
import { getTranslations } from "next-intl/server"
import type { ComponentType, SVGProps } from "react"

import { BrandOrnament } from "@/components/brand-mark"
import { Separator } from "@/components/ui/separator"

type Item = {
  key: "explainable" | "structured" | "guest"
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  titleKey: "explainableTitle" | "structuredTitle" | "guestTitle"
  bodyKey: "explainableBody" | "structuredBody" | "guestBody"
}

const ITEMS: Item[] = [
  {
    key: "explainable",
    Icon: ScanLine,
    titleKey: "explainableTitle",
    bodyKey: "explainableBody",
  },
  {
    key: "structured",
    Icon: Layers,
    titleKey: "structuredTitle",
    bodyKey: "structuredBody",
  },
  {
    key: "guest",
    Icon: UnlockKeyhole,
    titleKey: "guestTitle",
    bodyKey: "guestBody",
  },
]

export async function Differentiators() {
  const t = await getTranslations("differentiators")

  return (
    <section className="w-full border-t border-border/60">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <div className="mb-14 flex flex-col items-center gap-3">
          <BrandOrnament className="size-3 text-muted-foreground/70" />
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t("heading")}
          </h2>
        </div>

        <ul className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {ITEMS.map(({ key, Icon, titleKey, bodyKey }) => (
            <li key={key} className="flex flex-col gap-3 pt-6">
              <Separator className="mb-3 opacity-60" />
              <Icon className="size-5 text-muted-foreground" aria-hidden />
              <h3 className="text-base font-medium tracking-tight">{t(titleKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(bodyKey)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
