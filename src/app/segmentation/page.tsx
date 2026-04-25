import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { SegmentationWorkbench } from "@/features/segmentation/components/segmentation-workbench"
import { SURAH_COUNT } from "@/features/quran/lib/constants"
import { listSurahs } from "@/services/quran"
import {
  getFeaturedPublicWorkspace,
  listPublicWorkspaces,
  type WorkspaceDTO,
} from "@/services/segmentation"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("segmentation")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/segmentation" },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: "/segmentation",
    },
    twitter: {
      card: "summary",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  }
}

async function loadSegmentationBootstrapData(): Promise<{
  featuredWorkspace: WorkspaceDTO | null
  publicWorkspaces: WorkspaceDTO[]
  surahs: Awaited<ReturnType<typeof listSurahs>>["results"]
}> {
  const [featuredResult, workspacesResult, surahsResult] = await Promise.allSettled([
    getFeaturedPublicWorkspace(),
    listPublicWorkspaces(),
    listSurahs({
      page_size: SURAH_COUNT,
      ordering: "number",
    }),
  ])

  const featuredWorkspace = featuredResult.status === "fulfilled" ? featuredResult.value : null

  const publicWorkspaces =
    workspacesResult.status === "fulfilled" ? workspacesResult.value : []

  const surahs = surahsResult.status === "fulfilled" ? surahsResult.value.results : []

  return {
    featuredWorkspace,
    publicWorkspaces,
    surahs,
  }
}

export default async function SegmentationPage() {
  const { featuredWorkspace, publicWorkspaces, surahs } =
    await loadSegmentationBootstrapData()

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <SegmentationWorkbench
          initialWorkspaces={publicWorkspaces}
          featuredWorkspace={featuredWorkspace}
          surahs={surahs}
        />
      </main>
      <SiteFooter />
    </>
  )
}
