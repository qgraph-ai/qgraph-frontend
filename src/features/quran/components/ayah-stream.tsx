import { getTranslations } from "next-intl/server"

import { AyahBlock } from "@/features/quran/components/ayah-block"
import { getAllSurahAyahs } from "@/services/quran"

export async function AyahStream({ surahNumber }: { surahNumber: number }) {
  const t = await getTranslations("quran.reader")
  const ayahs = await getAllSurahAyahs(surahNumber)

  return (
    <section aria-label={t("ayahStreamLabel")}>
      <ol
        role="list"
        className="mx-auto max-w-2xl divide-y divide-border/40 text-start"
      >
        {ayahs.map((ayah) => (
          <AyahBlock
            key={ayah.number_global}
            ayah={ayah}
            srLabel={t("ayahScreenReaderLabel", {
              ayah: ayah.number_in_surah,
              surah: ayah.surah_number,
            })}
          />
        ))}
      </ol>
    </section>
  )
}
