"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { cn } from "@/lib/utils"
import type { SurahDistributionPayload } from "@/services/search"

import { blockHeading, isSurahDistributionPayload, type BlockProps } from "./block-types"
import { useSurahNames } from "./surah-name"
import { UnknownBlock } from "./unknown-block"

const SURAH_COUNT = 114

type ChartDatum = { surah: number; value: number }

function buildSeries(payload: SurahDistributionPayload): ChartDatum[] {
  const lookup = new Map<number, number>()
  for (const entry of payload.values) {
    if (
      Number.isFinite(entry.surah) &&
      entry.surah >= 1 &&
      entry.surah <= SURAH_COUNT &&
      Number.isFinite(entry.value)
    ) {
      lookup.set(Math.trunc(entry.surah), entry.value)
    }
  }
  const series: ChartDatum[] = []
  for (let surah = 1; surah <= SURAH_COUNT; surah++) {
    series.push({ surah, value: lookup.get(surah) ?? 0 })
  }
  return series
}

export function SurahDistributionBlock({ block }: BlockProps) {
  const valid = isSurahDistributionPayload(block.payload)
  const payload = valid ? (block.payload as SurahDistributionPayload) : null
  const series = useMemo(() => (payload ? buildSeries(payload) : []), [payload])
  const surahsQuery = useSurahNames()

  if (!payload) {
    return <UnknownBlock block={block} />
  }

  const heading = blockHeading(block)
  const yLabel = payload.y_label ?? ""
  const surahNames = surahsQuery.data ?? null

  return (
    <article className="rounded-2xl border border-border/60 bg-card/40 p-5 md:p-6">
      {heading ? (
        <h2 className="text-base font-medium leading-snug tracking-tight text-foreground">
          {heading}
        </h2>
      ) : null}
      {block.explanation ? (
        <p className="mt-1 text-xs text-muted-foreground">{block.explanation}</p>
      ) : null}

      <div className={cn("mt-4 w-full")}>
        <ResponsiveContainer width="100%" height={280} minWidth={0}>
          <BarChart
            data={series}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="surah"
              interval={9}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            />
            <YAxis
              allowDecimals={false}
              width={32}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
              label={
                yLabel
                  ? {
                      value: yLabel,
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      style: {
                        fill: "var(--color-muted-foreground)",
                        fontSize: 11,
                      },
                    }
                  : undefined
              }
            />
            <Tooltip
              cursor={{ fill: "var(--color-muted)", opacity: 0.5 }}
              content={(props) => {
                const raw = props as unknown as {
                  active?: boolean
                  payload?: ReadonlyArray<{ payload?: ChartDatum }>
                }
                return (
                  <SurahTooltip
                    active={Boolean(raw.active)}
                    payload={raw.payload ?? []}
                    surahNames={surahNames}
                    yLabel={yLabel || "Value"}
                  />
                )
              }}
            />
            <Bar
              dataKey="value"
              fill="var(--color-chart-1)"
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}

function SurahTooltip({
  active,
  payload,
  surahNames,
  yLabel,
}: {
  active: boolean
  payload: ReadonlyArray<{ payload?: ChartDatum }>
  surahNames: Map<
    number,
    { number: number; arabic_name: string; transliteration: string }
  > | null
  yLabel: string
}) {
  if (!active || payload.length === 0) return null
  const datum = payload[0]?.payload
  if (!datum) return null
  const surah = surahNames?.get(datum.surah) ?? null

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Surah {datum.surah}</span>
        {surah ? (
          <>
            <span aria-hidden>·</span>
            <span>{surah.transliteration}</span>
            <span
              dir="rtl"
              lang="ar"
              className="font-(family-name:--font-arabic) text-sm leading-none"
            >
              {surah.arabic_name}
            </span>
          </>
        ) : null}
      </div>
      <div className="mt-1 font-medium">
        {yLabel}: {datum.value}
      </div>
    </div>
  )
}
