export const SEGMENTATION_PATHS = {
  featuredWorkspace: "/api/v1/segmentation/public/workspaces/featured/",
  workspaceVersions: (slug: string) =>
    `/api/v1/segmentation/public/workspaces/${slug}/segmentation-versions/`,
  versionSegments: (publicId: string) =>
    `/api/v1/segmentation/public/segmentation-versions/${publicId}/segments/`,
  versionTags: (publicId: string) =>
    `/api/v1/segmentation/public/segmentation-versions/${publicId}/tags/`,
} as const
