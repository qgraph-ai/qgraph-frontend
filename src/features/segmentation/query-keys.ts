export const SEGMENTATION_QUERY_KEYS = {
  featuredWorkspace: ["segmentation", "public", "featured-workspace"] as const,
  publicWorkspaces: ["segmentation", "public", "workspaces"] as const,
  publicVersions: (
    workspaceSlug: string | null,
    surah: number | null,
    status: string
  ) =>
    [
      "segmentation",
      "public",
      "versions",
      workspaceSlug,
      surah,
      status,
    ] as const,
  publicSegments: (versionPublicId: string | null) =>
    ["segmentation", "public", "segments", versionPublicId] as const,
  ownerWorkspaces: ["segmentation", "owner", "workspaces"] as const,
  ownerVersions: (workspaceSlug: string | null, surah: number | null) =>
    ["segmentation", "owner", "versions", workspaceSlug, surah] as const,
  ownerVersionSegments: (versionPublicId: string | null) =>
    ["segmentation", "owner", "segments", versionPublicId] as const,
  ownerWorkspaceTags: (workspaceSlug: string | null) =>
    ["segmentation", "owner", "tags", workspaceSlug] as const,
} as const
