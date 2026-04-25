import { describe, expect, it } from "vitest"

import { SEGMENTATION_PATHS } from "@/services/segmentation"

describe("SEGMENTATION_PATHS", () => {
  it("builds public routes", () => {
    expect(SEGMENTATION_PATHS.publicWorkspaces).toBe(
      "/api/v1/segmentation/public/workspaces/"
    )
    expect(SEGMENTATION_PATHS.publicFeaturedWorkspace).toBe(
      "/api/v1/segmentation/public/workspaces/featured/"
    )
    expect(
      SEGMENTATION_PATHS.publicWorkspaceSegmentationVersions("featured")
    ).toBe("/api/v1/segmentation/public/workspaces/featured/segmentation-versions/")
    expect(SEGMENTATION_PATHS.publicSegmentationVersion("version-1")).toBe(
      "/api/v1/segmentation/public/segmentation-versions/version-1/"
    )
    expect(SEGMENTATION_PATHS.publicSegmentationVersionSegments("version-1")).toBe(
      "/api/v1/segmentation/public/segmentation-versions/version-1/segments/"
    )
    expect(SEGMENTATION_PATHS.publicSegmentationVersionTags("version-1")).toBe(
      "/api/v1/segmentation/public/segmentation-versions/version-1/tags/"
    )
  })

  it("builds owner workspace and version routes", () => {
    expect(SEGMENTATION_PATHS.workspaces).toBe("/api/v1/segmentation/workspaces/")
    expect(SEGMENTATION_PATHS.workspace("mine")).toBe(
      "/api/v1/segmentation/workspaces/mine/"
    )
    expect(SEGMENTATION_PATHS.workspaceSegmentationVersions("mine")).toBe(
      "/api/v1/segmentation/workspaces/mine/segmentation-versions/"
    )
    expect(SEGMENTATION_PATHS.workspaceTags("mine")).toBe(
      "/api/v1/segmentation/workspaces/mine/tags/"
    )
    expect(SEGMENTATION_PATHS.segmentationVersion("version-1")).toBe(
      "/api/v1/segmentation/segmentation-versions/version-1/"
    )
    expect(SEGMENTATION_PATHS.segmentationVersionSegments("version-1")).toBe(
      "/api/v1/segmentation/segmentation-versions/version-1/segments/"
    )
    expect(SEGMENTATION_PATHS.segmentationVersionActivate("version-1")).toBe(
      "/api/v1/segmentation/segmentation-versions/version-1/activate/"
    )
    expect(SEGMENTATION_PATHS.segmentationVersionSaveSnapshot("version-1")).toBe(
      "/api/v1/segmentation/segmentation-versions/version-1/save-snapshot/"
    )
  })
})
