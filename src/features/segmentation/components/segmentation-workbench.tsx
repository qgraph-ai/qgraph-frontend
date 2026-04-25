"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/use-auth"
import type { Surah } from "@/services/quran"
import type { SegmentationVersionDTO, WorkspaceDTO } from "@/services/segmentation"

import { MySegmentationPanel } from "./my-segmentation-panel"
import { PublicSegmentationPanel } from "./public-segmentation-panel"

export function SegmentationWorkbench({
  initialWorkspaces,
  featuredWorkspace,
  surahs,
}: {
  initialWorkspaces: WorkspaceDTO[]
  featuredWorkspace: WorkspaceDTO | null
  surahs: Surah[]
}) {
  const t = useTranslations("segmentation")
  const { status } = useAuth()
  const [activePublicVersion, setActivePublicVersion] =
    useState<SegmentationVersionDTO | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"preview" | "editor">("preview")

  const initialWorkspaceSlug = useMemo(() => {
    return featuredWorkspace?.slug ?? initialWorkspaces[0]?.slug ?? null
  }, [featuredWorkspace, initialWorkspaces])

  const defaultSurahNumber = surahs[0]?.number ?? null
  const isAuthenticated = status === "authenticated"
  const showEditorTabs = isAuthenticated && editorOpen
  const showEditorPanel = showEditorTabs && activeTab === "editor"

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-10 pb-16 md:px-6 md:pt-14">
      <header className="rounded-xl border border-border/70 bg-card px-5 py-6 md:px-6">
        <p className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground">
          {t("kicker")}
        </p>
        <h1 className="mt-2 text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {t("heroDescription")}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!isAuthenticated ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/auth/sign-in?next=%2Fsegmentation">{t("signInToEdit")}</Link>
            </Button>
          ) : showEditorTabs ? (
            <>
              <div className="inline-flex rounded-lg border border-border/70 bg-muted/40 p-1">
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    activeTab === "preview"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("preview")}
                >
                  {t("previewTab")}
                </button>
                <button
                  type="button"
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    activeTab === "editor"
                      ? "bg-background text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab("editor")}
                >
                  {t("editorTab")}
                </button>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditorOpen(false)
                  setActiveTab("preview")
                }}
              >
                {t("closeEditor")}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setEditorOpen(true)
                setActiveTab("editor")
              }}
            >
              {t("openEditor")}
            </Button>
          )}
        </div>
      </header>

      <div className="mt-5">
        {showEditorPanel ? (
          <MySegmentationPanel
            surahs={surahs}
            publicForkSourceVersion={activePublicVersion}
            defaultSurahNumber={defaultSurahNumber}
          />
        ) : (
          <PublicSegmentationPanel
            initialWorkspaces={initialWorkspaces}
            initialWorkspaceSlug={initialWorkspaceSlug}
            surahs={surahs}
            onPublicVersionSelected={setActivePublicVersion}
          />
        )}
      </div>
    </section>
  )
}
