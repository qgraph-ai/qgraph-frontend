import { getTranslations } from "next-intl/server"

import { getAllSurahAyahs } from "@/services/quran"
import { getAllSegments } from "@/services/segmentation"

import { groupSegments } from "../lib/group-segments"
import { buildSpineItems } from "../lib/spine-items"

import { SegmentCard } from "./segment-card"
import { ThemeSpine } from "./theme-spine"
import { UncoveredBlock } from "./uncovered-block"

export async function SegmentedAyahStream({
  surahNumber,
  versionPublicId,
}: {
  surahNumber: number
  versionPublicId: string
}) {
  const t = await getTranslations("segmentation.reader")
  const [ayahs, segments] = await Promise.all([
    getAllSurahAyahs(surahNumber),
    getAllSegments(versionPublicId),
  ])

  const blocks = groupSegments(ayahs, segments)
  const { items: spineItems } = buildSpineItems(blocks)

  const ayahLabel = (ayah: { number_in_surah: number; surah_number: number }) =>
    t("ayahScreenReaderLabel", {
      ayah: ayah.number_in_surah,
      surah: ayah.surah_number,
    })

  return (
    <>
      <ThemeSpine items={spineItems} />
      <section
        aria-label={t("ayahStreamLabel")}
        className="mx-auto flex max-w-2xl flex-col gap-5"
      >
        {blocks.map((block, i) => {
          if (block.kind === "segment") {
            return (
              <SegmentCard
                key={`seg-${block.segment.public_id}`}
                segment={block.segment}
                ayahs={block.ayahs}
              />
            )
          }
          return (
            <UncoveredBlock
              key={`gap-${i}-${block.ayahs[0]?.number_in_surah ?? "x"}`}
              ayahs={block.ayahs}
              label={t("gapBlockLabel")}
              ayahLabel={ayahLabel}
            />
          )
        })}
      </section>
    </>
  )
}
