"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Save, Split } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/features/auth/use-auth"
import {
  createScratchSegments,
  isValidCover,
  mergeAdjacentSegments,
  shiftBoundary,
  splitSegment,
  toggleSegmentTag,
  updateSegmentText,
  type EditableSegment,
} from "@/features/segmentation/lib/editor"
import {
  buildAyahIndexMaps,
  buildSaveSnapshotPayload,
  hydrateEditableSegments,
} from "@/features/segmentation/lib/mappers"
import { SEGMENTATION_QUERY_KEYS } from "@/features/segmentation/query-keys"
import { getAllSurahAyahs, type Ayah, type Surah } from "@/services/quran"
import {
  activateOwnerSegmentationVersion,
  createOwnerWorkspace,
  createOwnerWorkspaceSegmentationVersion,
  createOwnerWorkspaceTag,
  listOwnerSegmentationVersionSegments,
  listOwnerWorkspaceSegmentationVersions,
  listOwnerWorkspaces,
  listOwnerWorkspaceTags,
  saveOwnerSegmentationVersionSnapshot,
  type SegmentDTO,
  type SegmentationVersionDTO,
  type TagDTO,
  type WorkspaceDTO,
} from "@/services/segmentation"

import { TagPill } from "./tag-pill"

const HEX_RE = /^#(?:[0-9a-fA-F]{3}){1,2}$/
const EMPTY_WORKSPACES: WorkspaceDTO[] = []
const EMPTY_VERSIONS: SegmentationVersionDTO[] = []
const EMPTY_SEGMENTS: SegmentDTO[] = []
const EMPTY_TAGS: TagDTO[] = []
const EMPTY_AYAHS: Ayah[] = []

export function MySegmentationPanel({
  surahs,
  publicForkSourceVersion,
  defaultSurahNumber,
}: {
  surahs: Surah[]
  publicForkSourceVersion: SegmentationVersionDTO | null
  defaultSurahNumber: number | null
}) {
  const t = useTranslations("segmentation")
  const { status } = useAuth()
  const queryClient = useQueryClient()

  const [selectedWorkspaceSlug, setSelectedWorkspaceSlug] = useState<string | null>(null)
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(
    defaultSurahNumber
  )
  const [selectedVersionPublicId, setSelectedVersionPublicId] = useState<string | null>(null)

  const [workspaceTitle, setWorkspaceTitle] = useState("")
  const [workspaceDescription, setWorkspaceDescription] = useState("")

  const [tagName, setTagName] = useState("")
  const [tagColor, setTagColor] = useState("#22c55e")
  const [tagDescription, setTagDescription] = useState("")

  const [editorTitle, setEditorTitle] = useState("")
  const [editableSegments, setEditableSegments] = useState<EditableSegment[]>([])
  const [splitPoints, setSplitPoints] = useState<Record<string, number>>({})
  const [dirty, setDirty] = useState(false)
  const [editorBaseVersionPublicId, setEditorBaseVersionPublicId] = useState<string | null>(
    null
  )
  const [editorContractIssue, setEditorContractIssue] = useState<string | null>(null)

  const isAuthenticated = status === "authenticated"

  const ownerWorkspacesQuery = useQuery({
    queryKey: SEGMENTATION_QUERY_KEYS.ownerWorkspaces,
    enabled: isAuthenticated,
    queryFn: listOwnerWorkspaces,
  })

  const ownerWorkspaces = ownerWorkspacesQuery.data ?? EMPTY_WORKSPACES
  const resolvedWorkspaceSlug = useMemo(() => {
    if (!ownerWorkspaces.length) return null
    if (
      selectedWorkspaceSlug &&
      ownerWorkspaces.some((workspace) => workspace.slug === selectedWorkspaceSlug)
    ) {
      return selectedWorkspaceSlug
    }
    return ownerWorkspaces[0]?.slug ?? null
  }, [ownerWorkspaces, selectedWorkspaceSlug])

  const ownerVersionsQuery = useQuery({
    queryKey: SEGMENTATION_QUERY_KEYS.ownerVersions(
      resolvedWorkspaceSlug,
      selectedSurahNumber
    ),
    enabled: Boolean(isAuthenticated && resolvedWorkspaceSlug && selectedSurahNumber),
    queryFn: () =>
      listOwnerWorkspaceSegmentationVersions({
        slug: resolvedWorkspaceSlug!,
        surah: selectedSurahNumber ?? undefined,
      }),
  })

  const ownerVersions = ownerVersionsQuery.data ?? EMPTY_VERSIONS
  const resolvedVersionPublicId = useMemo(() => {
    if (!ownerVersions.length) return null
    if (
      selectedVersionPublicId &&
      ownerVersions.some((version) => version.public_id === selectedVersionPublicId)
    ) {
      return selectedVersionPublicId
    }
    return ownerVersions[0]?.public_id ?? null
  }, [ownerVersions, selectedVersionPublicId])

  const selectedVersion = useMemo(
    () => ownerVersions.find((version) => version.public_id === resolvedVersionPublicId) ?? null,
    [ownerVersions, resolvedVersionPublicId]
  )

  const ownerVersionSegmentsQuery = useQuery({
    queryKey: SEGMENTATION_QUERY_KEYS.ownerVersionSegments(resolvedVersionPublicId),
    enabled: Boolean(isAuthenticated && resolvedVersionPublicId),
    queryFn: () => listOwnerSegmentationVersionSegments(resolvedVersionPublicId!),
  })

  const ownerTagsQuery = useQuery({
    queryKey: SEGMENTATION_QUERY_KEYS.ownerWorkspaceTags(resolvedWorkspaceSlug),
    enabled: Boolean(isAuthenticated && resolvedWorkspaceSlug),
    queryFn: () => listOwnerWorkspaceTags(resolvedWorkspaceSlug!),
  })

  const ayahsQuery = useQuery({
    queryKey: ["segmentation", "editor", "ayahs", selectedSurahNumber],
    enabled: Boolean(isAuthenticated && selectedSurahNumber),
    queryFn: () => getAllSurahAyahs(selectedSurahNumber!),
  })

  const ayahs = ayahsQuery.data ?? EMPTY_AYAHS
  const ayahIndexMaps = useMemo(() => buildAyahIndexMaps(ayahs), [ayahs])

  // This synchronizes local editor state with the selected version snapshot.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!resolvedVersionPublicId) {
      setEditableSegments((current) => (current.length ? [] : current))
      setEditorBaseVersionPublicId((current) => (current === null ? current : null))
      setDirty(false)
      return
    }

    if (resolvedVersionPublicId === editorBaseVersionPublicId) {
      return
    }

    if (!ayahs.length || ownerVersionSegmentsQuery.isLoading) {
      return
    }

    const sourceSegments = ownerVersionSegmentsQuery.data ?? EMPTY_SEGMENTS

    if (!sourceSegments.length) {
      setEditableSegments(createScratchSegments(ayahs.length))
      setEditorTitle(selectedVersion?.title ?? "")
      setEditorBaseVersionPublicId(resolvedVersionPublicId)
      setDirty(false)
      setEditorContractIssue(null)
      return
    }

    const hydrated = hydrateEditableSegments(sourceSegments, ayahIndexMaps.ayahByIdentifier)
    if (!hydrated.ok) {
      setEditableSegments([])
      setEditorTitle(selectedVersion?.title ?? "")
      setEditorBaseVersionPublicId(resolvedVersionPublicId)
      setDirty(false)
      setEditorContractIssue(t("editorContractMismatch"))
      return
    }

    setEditableSegments(hydrated.segments)
    setEditorTitle(selectedVersion?.title ?? "")
    setEditorBaseVersionPublicId(resolvedVersionPublicId)
    setDirty(false)
    setEditorContractIssue(null)
  }, [
    ayahs.length,
    ayahIndexMaps.ayahByIdentifier,
    editorBaseVersionPublicId,
    ownerVersionSegmentsQuery.data,
    ownerVersionSegmentsQuery.isLoading,
    resolvedVersionPublicId,
    selectedVersion?.title,
    t,
  ])
  /* eslint-enable react-hooks/set-state-in-effect */

  const createWorkspaceMutation = useMutation({
    mutationFn: createOwnerWorkspace,
    onSuccess: async (workspace) => {
      toast.success(t("workspaceCreated"))
      setWorkspaceTitle("")
      setWorkspaceDescription("")
      setSelectedWorkspaceSlug(workspace.slug)
      await queryClient.invalidateQueries({
        queryKey: SEGMENTATION_QUERY_KEYS.ownerWorkspaces,
      })
    },
    onError: () => {
      toast.error(t("workspaceCreateError"))
    },
  })

  const createVersionMutation = useMutation({
    mutationFn: async (args: {
      workspaceSlug: string
      mode: "scratch" | "fork"
      payload: {
        surah?: number
        title?: string
        base_version_public_id?: string
      }
    }) => createOwnerWorkspaceSegmentationVersion(args.workspaceSlug, args.payload),
    onSuccess: async (version, vars) => {
      setSelectedVersionPublicId(version.public_id)
      setEditorTitle(version.title ?? "")
      setEditorContractIssue(null)
      setDirty(false)

      if (vars.mode === "scratch") {
        setEditableSegments(createScratchSegments(ayahs.length))
        setEditorBaseVersionPublicId(version.public_id)
      } else {
        setEditableSegments([])
        setEditorBaseVersionPublicId(null)
      }

      toast.success(
        vars.mode === "scratch" ? t("scratchVersionCreated") : t("forkVersionCreated")
      )

      await queryClient.invalidateQueries({
        queryKey: SEGMENTATION_QUERY_KEYS.ownerVersions(
          resolvedWorkspaceSlug,
          selectedSurahNumber
        ),
      })
    },
    onError: () => {
      toast.error(t("versionCreateError"))
    },
  })

  const createTagMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("Missing selected workspace")
      }
      return createOwnerWorkspaceTag(resolvedWorkspaceSlug, {
        name: tagName.trim(),
        color: tagColor.trim(),
        description: tagDescription.trim(),
      })
    },
    onSuccess: async () => {
      toast.success(t("tagCreated"))
      setTagName("")
      setTagDescription("")
      await queryClient.invalidateQueries({
        queryKey: SEGMENTATION_QUERY_KEYS.ownerWorkspaceTags(resolvedWorkspaceSlug),
      })
    },
    onError: () => {
      toast.error(t("tagCreateError"))
    },
  })

  const saveSnapshotMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedVersionPublicId) {
        throw new Error("Missing selected version")
      }

      return saveOwnerSegmentationVersionSnapshot(
        resolvedVersionPublicId,
        buildSaveSnapshotPayload(
          editorTitle.trim(),
          editableSegments,
          ayahIndexMaps.ayahByNumberInSurah
        )
      )
    },
    onSuccess: async (newVersion) => {
      setSelectedVersionPublicId(newVersion.public_id)
      setEditorBaseVersionPublicId(newVersion.public_id)
      setDirty(false)
      toast.success(t("snapshotSaved"))

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: SEGMENTATION_QUERY_KEYS.ownerVersions(
            resolvedWorkspaceSlug,
            selectedSurahNumber
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: SEGMENTATION_QUERY_KEYS.ownerVersionSegments(
            resolvedVersionPublicId
          ),
        }),
      ])
    },
    onError: () => {
      toast.error(t("snapshotSaveError"))
    },
  })

  const activateVersionMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedVersionPublicId) {
        throw new Error("Missing selected version")
      }
      return activateOwnerSegmentationVersion(resolvedVersionPublicId)
    },
    onSuccess: async () => {
      toast.success(t("versionActivated"))
      await queryClient.invalidateQueries({
        queryKey: SEGMENTATION_QUERY_KEYS.ownerVersions(
          resolvedWorkspaceSlug,
          selectedSurahNumber
        ),
      })
    },
    onError: () => {
      toast.error(t("versionActivateError"))
    },
  })

  const canCreateScratch = Boolean(
    resolvedWorkspaceSlug && selectedSurahNumber && ayahs.length
  )
  const canCreateFork = Boolean(resolvedWorkspaceSlug && publicForkSourceVersion)
  const canSave = Boolean(
    resolvedVersionPublicId &&
      editableSegments.length &&
      ayahs.length &&
      isValidCover(editableSegments, ayahs.length)
  )

  function applySegments(next: EditableSegment[]) {
    setEditableSegments(next)
    setDirty(true)
  }

  function segmentAyahText(segment: EditableSegment): string {
    const ayahText = Array.from(
      { length: segment.endAyahNo - segment.startAyahNo + 1 },
      (_, index) => segment.startAyahNo + index
    )
      .map((numberInSurah) => ayahIndexMaps.ayahByNumberInSurah.get(numberInSurah)?.text_ar)
      .filter((text): text is string => Boolean(text))
      .join(" ۝ ")

    return ayahText
  }

  if (status === "loading") {
    return (
      <Card className="border-border/70 bg-card">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">{t("editorTab")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (status !== "authenticated") {
    return (
      <Card className="border-border/70 bg-card">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">{t("editorTab")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("authRequiredDescription")}</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/auth/sign-in?next=%2Fsegmentation">{t("signInToEdit")}</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const ownerTags = ownerTagsQuery.data ?? EMPTY_TAGS

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="border-b border-border/70 pb-4">
        <CardTitle className="text-base md:text-lg">{t("editorTab")}</CardTitle>
        <p className="text-xs text-muted-foreground">{t("myPanelDescription")}</p>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1.5 text-xs text-muted-foreground">
            <span>{t("myWorkspaceLabel")}</span>
            <select
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
              value={resolvedWorkspaceSlug ?? ""}
              onChange={(event) => setSelectedWorkspaceSlug(event.target.value || null)}
            >
              {!ownerWorkspaces.length ? <option value="">{t("emptyOwnerWorkspaces")}</option> : null}
              {ownerWorkspaces.map((workspace) => (
                <option key={workspace.slug} value={workspace.slug}>
                  {workspace.title}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-xs text-muted-foreground">
            <span>{t("surahLabel")}</span>
            <select
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
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
            <span>{t("versionLabel")}</span>
            <select
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
              value={resolvedVersionPublicId ?? ""}
              onChange={(event) => setSelectedVersionPublicId(event.target.value || null)}
            >
              {!ownerVersions.length ? <option value="">{t("emptyVersions")}</option> : null}
              {ownerVersions.map((version) => (
                <option key={version.public_id} value={version.public_id}>
                  {version.title || t("untitledVersion")} · {version.status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (!resolvedWorkspaceSlug || !selectedSurahNumber) return
              createVersionMutation.mutate({
                workspaceSlug: resolvedWorkspaceSlug,
                mode: "scratch",
                payload: {
                  surah: selectedSurahNumber,
                  title: t("scratchVersionTitle"),
                },
              })
            }}
            disabled={!canCreateScratch || createVersionMutation.isPending}
          >
            {t("createScratchAction")}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              if (!resolvedWorkspaceSlug || !publicForkSourceVersion) return
              setSelectedSurahNumber(publicForkSourceVersion.surah)
              createVersionMutation.mutate({
                workspaceSlug: resolvedWorkspaceSlug,
                mode: "fork",
                payload: {
                  surah: publicForkSourceVersion.surah,
                  base_version_public_id: publicForkSourceVersion.public_id,
                  title: t("forkVersionTitle", {
                    title: publicForkSourceVersion.title || t("untitledVersion"),
                  }),
                },
              })
            }}
            disabled={!canCreateFork || createVersionMutation.isPending}
          >
            {t("forkPublicAction")}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => activateVersionMutation.mutate()}
            disabled={!resolvedVersionPublicId || activateVersionMutation.isPending}
          >
            {t("activateVersionAction")}
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => saveSnapshotMutation.mutate()}
            disabled={!canSave || saveSnapshotMutation.isPending || !dirty}
          >
            <Save className="size-3.5" aria-hidden />
            {t("saveSnapshotAction")}
          </Button>
        </div>

        <details className="rounded-lg border border-border/70 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            {t("createWorkspaceTitle")}
          </summary>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <input
              value={workspaceTitle}
              onChange={(event) => setWorkspaceTitle(event.target.value)}
              placeholder={t("workspaceTitlePlaceholder")}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            />
            <input
              value={workspaceDescription}
              onChange={(event) => setWorkspaceDescription(event.target.value)}
              placeholder={t("workspaceDescriptionPlaceholder")}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            />
            <Button
              type="button"
              size="sm"
              onClick={() =>
                createWorkspaceMutation.mutate({
                  title: workspaceTitle.trim(),
                  description: workspaceDescription.trim(),
                })
              }
              disabled={!workspaceTitle.trim() || createWorkspaceMutation.isPending}
            >
              {t("createWorkspaceAction")}
            </Button>
          </div>
        </details>

        <details className="rounded-lg border border-border/70 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
            {t("workspaceTagsTitle")}
          </summary>
          <div className="mt-2 grid gap-2 md:grid-cols-4">
            <input
              value={tagName}
              onChange={(event) => setTagName(event.target.value)}
              placeholder={t("tagNamePlaceholder")}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            />
            <input
              value={tagColor}
              onChange={(event) => setTagColor(event.target.value)}
              placeholder="#22c55e"
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            />
            <input
              value={tagDescription}
              onChange={(event) => setTagDescription(event.target.value)}
              placeholder={t("tagDescriptionPlaceholder")}
              className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => createTagMutation.mutate()}
              disabled={
                !resolvedWorkspaceSlug ||
                !tagName.trim() ||
                !HEX_RE.test(tagColor.trim()) ||
                createTagMutation.isPending
              }
            >
              {t("createTagAction")}
            </Button>
          </div>
          {ownerTags.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {ownerTags.map((tag) => (
                <TagPill key={tag.public_id} name={tag.name} color={tag.color} compact />
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">{t("emptyWorkspaceTags")}</p>
          )}
        </details>

        <input
          value={editorTitle}
          onChange={(event) => {
            setEditorTitle(event.target.value)
            setDirty(true)
          }}
          placeholder={t("versionTitlePlaceholder")}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
        />

        {editorContractIssue ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {editorContractIssue}
          </p>
        ) : null}

        {!canSave ? (
          <p className="text-xs text-muted-foreground">{t("editorCoverageHint")}</p>
        ) : null}

        {!editableSegments.length ? (
          <p className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {selectedVersion ? t("emptyEditorSegments") : t("selectVersionToEdit")}
          </p>
        ) : null}

        <ol role="list" className="space-y-3">
          {editableSegments.map((segment, index) => {
            const hasNext = index < editableSegments.length - 1
            const span = segment.endAyahNo - segment.startAyahNo + 1
            const splitValue =
              splitPoints[segment.id] ??
              Math.floor((segment.startAyahNo + segment.endAyahNo) / 2)
            const canSplit = span >= 2
            const ayahText = segmentAyahText(segment)

            return (
              <li key={segment.id} className="rounded-lg border border-border/70 bg-card p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {t("segmentRangeByNumber", {
                    start: segment.startAyahNo,
                    end: segment.endAyahNo,
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

                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input
                      value={segment.title}
                      onChange={(event) =>
                        applySegments(
                          updateSegmentText(editableSegments, index, {
                            title: event.target.value,
                            summary: segment.summary,
                          })
                        )
                      }
                      placeholder={t("segmentTitlePlaceholder")}
                      className="h-8 rounded-lg border border-input bg-background px-2.5 text-sm"
                    />

                    <textarea
                      value={segment.summary}
                      onChange={(event) =>
                        applySegments(
                          updateSegmentText(editableSegments, index, {
                            title: segment.title,
                            summary: event.target.value,
                          })
                        )
                      }
                      placeholder={t("segmentSummaryPlaceholder")}
                      rows={2}
                      className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm"
                    />
                  </div>

                  {ownerTags.length ? (
                    <div className="mt-2 grid gap-1.5 md:grid-cols-2">
                      {ownerTags.map((tag) => {
                        const checked = segment.tagPublicIds.includes(tag.public_id)
                        return (
                          <label
                            key={`${segment.id}:${tag.public_id}`}
                            className="inline-flex items-center gap-2 rounded-md border border-border/70 px-2 py-1"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                applySegments(
                                  toggleSegmentTag(editableSegments, index, tag.public_id)
                                )
                              }
                            />
                            <TagPill name={tag.name} color={tag.color} compact />
                          </label>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">{t("emptyWorkspaceTags")}</p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background px-1.5 py-1">
                      <Split className="size-3.5 text-muted-foreground" aria-hidden />
                      <input
                        type="number"
                        min={segment.startAyahNo}
                        max={segment.endAyahNo - 1}
                        value={splitValue}
                        onChange={(event) => {
                          const raw = Number(event.target.value)
                          setSplitPoints((current) => ({
                            ...current,
                            [segment.id]: Number.isFinite(raw) ? raw : splitValue,
                          }))
                        }}
                        disabled={!canSplit}
                        className="h-6 w-16 rounded border border-input bg-background px-1 text-xs"
                      />
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          const next = splitSegment(editableSegments, index, splitValue)
                          if (next !== editableSegments) {
                            applySegments(next)
                          }
                        }}
                        disabled={!canSplit}
                      >
                        {t("splitAction")}
                      </Button>
                    </div>

                    {hasNext ? (
                      <>
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={() =>
                            applySegments(mergeAdjacentSegments(editableSegments, index))
                          }
                        >
                          {t("mergeNextAction")}
                        </Button>

                        <div className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-background px-1.5 py-1">
                          <Button
                            type="button"
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              applySegments(shiftBoundary(editableSegments, index, -1))
                            }
                          >
                            -1
                          </Button>
                          <span className="font-mono text-[0.68rem] text-muted-foreground">
                            {t("boundaryAt", { boundary: segment.endAyahNo })}
                          </span>
                          <Button
                            type="button"
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              applySegments(shiftBoundary(editableSegments, index, 1))
                            }
                          >
                            +1
                          </Button>
                        </div>
                      </>
                    ) : null}
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
