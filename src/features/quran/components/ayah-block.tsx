import { toArabicDigits } from "@/features/quran/lib/format"
import type { Ayah } from "@/services/quran"

export function AyahBlock({ ayah, srLabel }: { ayah: Ayah; srLabel: string }) {
  return (
    <li
      id={`ayah-${ayah.number_in_surah}`}
      className="scroll-mt-20 py-5 first:pt-2"
    >
      <p
        dir="rtl"
        lang="ar"
        className="font-[family-name:var(--font-arabic)] text-2xl leading-[2.15] md:text-[2.1rem] md:leading-[2.1]"
      >
        {ayah.text_ar}
        <span
          aria-hidden
          className="ms-2 inline-flex select-none items-center text-foreground/70"
        >
          {"۝"}
          {toArabicDigits(ayah.number_in_surah)}
        </span>
      </p>
      <span className="sr-only">{srLabel}</span>
    </li>
  )
}
