import { toArabicDigits } from "@/features/quran/lib/format"
import type { Ayah } from "@/services/quran"

export function UncoveredBlock({
  ayahs,
  label,
  ayahLabel,
}: {
  ayahs: Ayah[]
  label: string
  ayahLabel: (ayah: Ayah) => string
}) {
  return (
    <section
      aria-label={label}
      className="rounded-2xl border border-dashed border-border/50 px-4 py-3 md:px-6 md:py-4"
    >
      <p className="mb-2 text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </p>
      <ol role="list" className="divide-y divide-border/30 text-start">
        {ayahs.map((ayah) => (
          <li
            key={ayah.number_global}
            id={`ayah-${ayah.number_in_surah}`}
            className="scroll-mt-20 py-4 first:pt-1 last:pb-1"
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
            <span className="sr-only">{ayahLabel(ayah)}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
