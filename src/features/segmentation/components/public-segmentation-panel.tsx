"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { buildAyahIndexMaps } from "@/features/segmentation/lib/mappers"
import { SEGMENTATION_QUERY_KEYS } from "@/features/segmentation/query-keys"
import { getAllSurahAyahs, type Ayah, type Surah } from "@/services/quran"
import {
  listPublicSegmentationVersionSegments,
  listPublicSegmentationVersionTags,
  listPublicSegmentationVersions,
  listPublicWorkspaces,
  type SegmentDTO,
  type SegmentationStatus,
  type SegmentationVersionDTO,
  type TagDTO,
  type WorkspaceDTO,
} from "@/services/segmentation"

import { TagPill } from "./tag-pill"

const STATUS_OPTIONS: Array<{
  value: "default" | SegmentationStatus
  key: "statusDefault" | "statusActive" | "statusDraft" | "statusArchived"
}> = [
  { value: "default", key: "statusDefault" },
  { value: "active", key: "statusActive" },
  { value: "draft", key: "statusDraft" },
  { value: "archived", key: "statusArchived" },
]

const EMPTY_WORKSPACES: WorkspaceDTO[] = []
const EMPTY_VERSIONS: SegmentationVersionDTO[] = []
const EMPTY_SEGMENTS: SegmentDTO[] = []
const EMPTY_TAGS: TagDTO[] = []
const EMPTY_AYAHS: Ayah[] = []

export function PublicSegmentationPanel({
  initialWorkspaces,
  initialWorkspaceSlug,
  surahs,
  onPublicVersionSelected,
}: {
  initialWorkspaces: WorkspaceDTO[]
  initialWorkspaceSlug: string | null
  surahs: Surah[]
  onPublicVersionSelected: (version: SegmentationVersionDTO | null) => void
}) {
  const t = useTranslations("segmentation")
  const [selectedWorkspaceSlug, setSelectedWorkspaceSlug] = useState<string | null>(
    initialWorkspaceSlug
  )
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(
    surahs[0]?.number ?? null
  )
  const [selectedStatus, setSelectedStatus] = useState<"default" | SegmentationStatus>(
    "default"
  )
  const [selectedVersionPublicId, setSelectedVersionPublicId] = useState<string | null>(
    null
  )

  const workspacesQuery = useQuery({
    queryKey: SEGMENTATION_QUERY_KEYS.publicWorkspaces,
    queryFn: listPublicWorkspaces,
    initialData: initialWorkspaces,
  })

  const workspaceRows = workspacesQuery.data ?? EMPTY_WORKSPACES
  const resolvedWorkspaceSlug = useMemo(() => {
    if (!workspaceRows.length) return null
    if (
      selectedWorkspaceSlug &&
      workspaceRows.some((workspace) => workspace.slug === selectedWorkspaceSlug)
    ) {
      return selectedWorkspaceSlug
    }
    if (
      initialWorkspaceSlug &&
      workspaceRows.some((workspace) => workspace.slug === initialWorkspaceSlug)
    ) {
      return initialWorkspaceSlug
    }
    return workspaceRows[0]?.slug ?? null
  }, [initialWorkspaceSlug, selectedWorkspaceSlug, workspaceRows])

  const versionsQuery = useQuery({
    queryKey: SEGMENTATION_QUERY_KEYS.publicVersions(
      resolvedWorkspaceSlug,
      selectedSurahNumber,
      selectedStatus
    ),
    enabled: Boolean(resolvedWorkspaceSlug && selectedSurahNumber),
    queryFn: () =>
      listPublicSegmentationVersions({
        slug: resolvedWorkspaceSlug!,
        surah: selectedSurahNumber ?? undefined,
        status: selectedStatus === "default" ? undefined : selectedStatus,
      }),
  })

  const versionRows = versionsQuery.data ?? EMPTY_VERSIONS
  const resolvedVersionPublicId = useMemo(() => {
    if (!versionRows.length) return null
    if (
      selectedVersionPublicId &&
      versionRows.some((version) => version.public_id === selectedVersionPublicId)
    ) {
      return selectedVersionPublicId
    }
    return versionRows[0]?.public_id ?? null
  }, [selectedVersionPublicId, versionRows])

  const selectedVersion = useMemo(
    () => versionRows.find((version) => version.public_id === resolvedVersionPublicId) ?? null,
    [resolvedVersionPublicId, versionRows]
  )

  useEffect(() => {
    onPublicVersionSelected(selectedVersion)
  }, [selectedVersion, onPublicVersionSelected])

  const segmentsQuery = useQuery({
    queryKey: SEGMENTATION_QUERY_KEYS.publicSegments(resolvedVersionPublicId),
    enabled: Boolean(resolvedVersionPublicId),
    queryFn: () => listPublicSegmentationVersionSegments(resolvedVersionPublicId!),
  })

  const tagsQuery = useQuery({
    queryKey: ["segmentation", "public", "version-tags", resolvedVersionPublicId],
    enabled: Boolean(resolvedVersionPublicId),
    queryFn: () => listPublicSegmentationVersionTags(resolvedVersionPublicId!),
  })

  const ayahsQuery = useQuery({
    queryKey: ["segmentation", "public", "ayahs", selectedSurahNumber],
    enabled: Boolean(selectedSurahNumber),
    queryFn: () => getAllSurahAyahs(selectedSurahNumber!),
  })

  const segments = segmentsQuery.data ?? EMPTY_SEGMENTS
  const usedTags = tagsQuery.data ?? EMPTY_TAGS
  const ayahs = ayahsQuery.data ?? EMPTY_AYAHS
  const ayahIndexMaps = useMemo(() => buildAyahIndexMaps(ayahs), [ayahs])

  const hasIdentifierMismatch = useMemo(() => {
    if (!segments.length) return false
    return segments.some((segment) => {
      const start = ayahIndexMaps.ayahByIdentifier.get(segment.start_ayah)
      const end = ayahIndexMaps.ayahByIdentifier.get(segment.end_ayah)
      return !start || !end
    })
  }, [ayahIndexMaps.ayahByIdentifier, segments])

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle className="text-base md:text-lg">{t("publicPanelTitle")}</CardTitle>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("publicPanelDescription")}</p>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-xs text-muted-foreground">
            <span>{t("publicWorkspaceLabel")}</span>
            <select
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={resolvedWorkspaceSlug ?? ""}
              onChange={(event) => setSelectedWorkspaceSlug(event.target.value || null)}
            >
              {!workspaceRows.length ? <option value="">{t("emptyWorkspaces")}</option> : null}
              {workspaceRows.map((workspace) => (
                <option key={workspace.slug} value={workspace.slug}>
                  {workspace.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-xs text-muted-foreground">
            <span>{t("surahLabel")}</span>
            <select
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={selectedSurahNumber ?? ""}
              onChange={(event) => setSelectedSurahNumber(Number(event.target.value) || null)}
            >
              {surahs.map((surah) => (
                <option key={surah.number} value={surah.number}>
                  {surah.number}. {surah.transliteration}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-xs text-muted-foreground">
            <span>{t("statusLabel")}</span>
            <select
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(event.target.value as "default" | SegmentationStatus)
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-xs text-muted-foreground">
            <span>{t("versionLabel")}</span>
            <select
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={resolvedVersionPublicId ?? ""}
              onChange={(event) => setSelectedVersionPublicId(event.target.value || null)}
            >
              {!versionRows.length ? <option value="">{t("emptyVersions")}</option> : null}
              {versionRows.map((version) => (
                <option key={version.public_id} value={version.public_id}>
                  {version.title || t("untitledVersion")} · {version.status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {versionsQuery.isLoading || ayahsQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : null}

        {versionsQuery.error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {t("publicVersionsLoadError")}
          </p>
        ) : null}

        {ayahsQuery.error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {t("ayahsLoadError")}
          </p>
        ) : null}

        {hasIdentifierMismatch ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {t("segmentIdentifierMismatch")}
          </p>
        ) : null}

        {usedTags.length ? (
          <div className="flex flex-wrap gap-2">
            {usedTags.map((tag) => (
              <TagPill key={tag.public_id} name={tag.name} color={tag.color} compact />
            ))}
          </div>
        ) : null}

        {!segmentsQuery.isLoading && !segments.length ? (
          <p className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {t("emptySegments")}
          </p>
        ) : null}

        <ol role="list" className="space-y-3">
          {segments.map((segment) => {
            const startAyah = ayahIndexMaps.ayahByIdentifier.get(segment.start_ayah)
            const endAyah = ayahIndexMaps.ayahByIdentifier.get(segment.end_ayah)

            const ayahNumbers =
              startAyah && endAyah
                ? Array.from(
                    { length: endAyah.number_in_surah - startAyah.number_in_surah + 1 },
                    (_, index) => startAyah.number_in_surah + index
                  )
                : []

            const ayahText = ayahNumbers
              .map((numberInSurah) => ayahIndexMaps.ayahByNumberInSurah.get(numberInSurah)?.text_ar)
              .filter((text): text is string => Boolean(text))
              .join(" ۝ ")

            return (
              <li key={segment.public_id} className="rounded-lg border border-border/70 bg-card p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {t("segmentRangeLabel", {
                    start: startAyah?.number_in_surah ?? segment.start_ayah,
                    end: endAyah?.number_in_surah ?? segment.end_ayah,
                  })}
                </p>

                {ayahText ? (
                  <p
                    dir="rtl"
                    lang="ar"
                    className="mt-2 text-start font-[family-name:var(--font-arabic)] text-2xl leading-[2.1rem]"
                  >
                    {ayahText}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">{t("missingAyahText")}</p>
                )}

                <details className="mt-3 rounded-lg border border-border/70 bg-muted/30 px-2.5 py-2">
                  <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                    {t("segmentDetailsAction")}
                  </summary>

                  <div className="mt-2 space-y-2 text-sm">
                    {segment.title ? (
                      <p>
                        <span className="text-muted-foreground">{t("segmentTitleLabel")}: </span>
                        {segment.title}
                      </p>
                    ) : null}

                    {segment.summary ? (
                      <p className="leading-relaxed text-muted-foreground">{segment.summary}</p>
                    ) : null}

                    {segment.tags.length ? (
                      <div className="flex flex-wrap gap-2">
                        {segment.tags.map((tag) => (
                          <TagPill
                            key={`${segment.public_id}:${tag.public_id}`}
                            name={tag.name}
                            color={tag.color}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">{t("emptySegmentTags")}</p>
                    )}
                  </div>
                </details>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}
