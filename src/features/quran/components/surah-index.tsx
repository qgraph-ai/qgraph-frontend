import { getTranslations } from "next-intl/server"

import { SurahRow } from "@/features/quran/components/surah-row"
import { SURAH_COUNT } from "@/features/quran/lib/constants"
import { listSurahs } from "@/services/quran"

export async function SurahIndex({
  basePath = "/quran",
}: {
  basePath?: string
} = {}) {
  const t = await getTranslations("quran.reader")
  const data = await listSurahs({ page_size: SURAH_COUNT, ordering: "number" })

  return (
    <ul className="divide-y divide-border/60" role="list">
      {data.results.map((surah) => (
        <li key={surah.number}>
          <SurahRow
            surah={surah}
            basePath={basePath}
            revelationLabel={
              surah.revelation_place ? t(surah.revelation_place) : undefined
            }
          />
        </li>
      ))}
    </ul>
  )
}
