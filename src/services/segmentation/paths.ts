export const SEGMENTATION_PATHS = {
  health: "/api/v1/segmentation/health/",

  publicWorkspaces: "/api/v1/segmentation/public/workspaces/",
  publicFeaturedWorkspace: "/api/v1/segmentation/public/workspaces/featured/",
  publicWorkspaceSegmentationVersions: (slug: string) =>
    `/api/v1/segmentation/public/workspaces/${slug}/segmentation-versions/`,
  publicSegmentationVersion: (publicId: string) =>
    `/api/v1/segmentation/public/segmentation-versions/${publicId}/`,
  publicSegmentationVersionSegments: (publicId: string) =>
    `/api/v1/segmentation/public/segmentation-versions/${publicId}/segments/`,
  publicSegmentationVersionTags: (publicId: string) =>
    `/api/v1/segmentation/public/segmentation-versions/${publicId}/tags/`,

  workspaces: "/api/v1/segmentation/workspaces/",
  workspace: (slug: string) => `/api/v1/segmentation/workspaces/${slug}/`,
  workspaceSegmentationVersions: (slug: string) =>
    `/api/v1/segmentation/workspaces/${slug}/segmentation-versions/`,
  workspaceTags: (slug: string) => `/api/v1/segmentation/workspaces/${slug}/tags/`,

  segmentationVersion: (publicId: string) =>
    `/api/v1/segmentation/segmentation-versions/${publicId}/`,
  segmentationVersionSegments: (publicId: string) =>
    `/api/v1/segmentation/segmentation-versions/${publicId}/segments/`,
  segmentationVersionActivate: (publicId: string) =>
    `/api/v1/segmentation/segmentation-versions/${publicId}/activate/`,
  segmentationVersionSaveSnapshot: (publicId: string) =>
    `/api/v1/segmentation/segmentation-versions/${publicId}/save-snapshot/`,
} as const
