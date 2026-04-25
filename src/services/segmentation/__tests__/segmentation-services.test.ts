import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"
import {
  activateOwnerSegmentationVersion,
  createOwnerWorkspace,
  createOwnerWorkspaceTag,
  createOwnerWorkspaceSegmentationVersion,
  getFeaturedPublicWorkspace,
  listOwnerSegmentationVersionSegments,
  listOwnerWorkspaceTags,
  listOwnerWorkspaces,
  listOwnerWorkspaceSegmentationVersions,
  listPublicSegmentationVersionSegments,
  listPublicSegmentationVersionTags,
  listPublicSegmentationVersions,
  listPublicWorkspaces,
  saveOwnerSegmentationVersionSnapshot,
  SEGMENTATION_PATHS,
  type SegmentationStatus,
} from "@/services/segmentation"

import { server } from "../../../../tests/msw/server"

const SAMPLE_WORKSPACE = {
  id: 1,
  slug: "featured-workspace",
  title: "Featured",
  description: "desc",
  visibility: "public",
  is_featured: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
} as const

const SAMPLE_VERSION = {
  id: 15,
  public_id: "d69f2ce3-03f7-4cd6-ae98-9c9dc95511ce",
  workspace: 1,
  surah: 2,
  title: "A",
  status: "draft",
  origin: "user",
  base_version: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
} as const

describe("segmentation services", () => {
  it("loads featured public workspace", async () => {
    server.use(
      http.get(`${API_URL}${SEGMENTATION_PATHS.publicFeaturedWorkspace}`, () => {
        return HttpResponse.json(SAMPLE_WORKSPACE)
      })
    )

    const featured = await getFeaturedPublicWorkspace()
    expect(featured.slug).toBe("featured-workspace")
    expect(featured.is_featured).toBe(true)
  })

  it("collects all paginated public workspaces", async () => {
    server.use(
      http.get(`${API_URL}${SEGMENTATION_PATHS.publicWorkspaces}`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get("page") ?? "1")
        if (page === 1) {
          return HttpResponse.json({
            count: 2,
            next: `${API_URL}${SEGMENTATION_PATHS.publicWorkspaces}?page=2&page_size=200`,
            previous: null,
            results: [SAMPLE_WORKSPACE],
          })
        }

        return HttpResponse.json({
          count: 2,
          next: null,
          previous: `${API_URL}${SEGMENTATION_PATHS.publicWorkspaces}?page=1&page_size=200`,
          results: [
            {
              ...SAMPLE_WORKSPACE,
              id: 2,
              slug: "second-workspace",
              title: "Second",
              is_featured: false,
            },
          ],
        })
      })
    )

    const rows = await listPublicWorkspaces()

    expect(rows).toHaveLength(2)
    expect(rows[0].slug).toBe("featured-workspace")
    expect(rows[1].slug).toBe("second-workspace")
  })

  it("omits status query when listing public versions with default backend filter", async () => {
    let observedStatus: string | null = "not-called"

    server.use(
      http.get(
        `${API_URL}/api/v1/segmentation/public/workspaces/:slug/segmentation-versions/`,
        ({ request }) => {
          observedStatus = new URL(request.url).searchParams.get("status")
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                ...SAMPLE_VERSION,
                status: "active",
                origin: "ai",
              },
            ],
          })
        }
      )
    )

    const versions = await listPublicSegmentationVersions({
      slug: "featured-workspace",
      surah: 2,
    })

    expect(observedStatus).toBeNull()
    expect(versions[0].status).toBe("active")
  })

  it("forwards explicit status filter on public version list", async () => {
    let observedStatus: string | null = null

    server.use(
      http.get(
        `${API_URL}/api/v1/segmentation/public/workspaces/:slug/segmentation-versions/`,
        ({ request }) => {
          observedStatus = new URL(request.url).searchParams.get("status")
          return HttpResponse.json({
            count: 0,
            next: null,
            previous: null,
            results: [],
          })
        }
      )
    )

    const status: SegmentationStatus = "archived"

    await listPublicSegmentationVersions({
      slug: "featured-workspace",
      surah: 2,
      status,
    })

    expect(observedStatus).toBe("archived")
  })

  it("posts workspace version create payload for fork flow", async () => {
    let capturedBody: unknown = null

    server.use(
      http.post(
        `${API_URL}/api/v1/segmentation/workspaces/:slug/segmentation-versions/`,
        async ({ request }) => {
          capturedBody = await request.json()
          return HttpResponse.json(SAMPLE_VERSION, { status: 201 })
        }
      )
    )

    await createOwnerWorkspaceSegmentationVersion("my-workspace", {
      surah: 2,
      title: "forked",
      base_version_public_id: "423bf220-c6cd-4310-a4d8-8502c4c897e7",
    })

    expect(capturedBody).toEqual({
      surah: 2,
      title: "forked",
      base_version_public_id: "423bf220-c6cd-4310-a4d8-8502c4c897e7",
    })
  })

  it("posts save snapshot payload and returns the new version", async () => {
    let capturedBody: unknown = null

    server.use(
      http.post(
        `${API_URL}/api/v1/segmentation/segmentation-versions/:publicId/save-snapshot/`,
        async ({ request }) => {
          capturedBody = await request.json()
          return HttpResponse.json({
            ...SAMPLE_VERSION,
            id: 16,
            public_id: "f4344f67-e20e-430e-9078-b2a1aab46569",
            title: "new snapshot",
          })
        }
      )
    )

    const next = await saveOwnerSegmentationVersionSnapshot(
      "d69f2ce3-03f7-4cd6-ae98-9c9dc95511ce",
      {
        title: "new snapshot",
        segments: [
          {
            start_ayah: 2001,
            end_ayah: 2005,
            title: "segment",
            summary: "summary",
            tags: ["11111111-1111-1111-1111-111111111111"],
          },
        ],
      }
    )

    expect(capturedBody).toEqual({
      title: "new snapshot",
      segments: [
        {
          start_ayah: 2001,
          end_ayah: 2005,
          title: "segment",
          summary: "summary",
          tags: ["11111111-1111-1111-1111-111111111111"],
        },
      ],
    })
    expect(next.id).toBe(16)
    expect(next.title).toBe("new snapshot")
  })

  it("activates selected version", async () => {
    let calls = 0

    server.use(
      http.post(
        `${API_URL}/api/v1/segmentation/segmentation-versions/:publicId/activate/`,
        () => {
          calls += 1
          return HttpResponse.json({
            ...SAMPLE_VERSION,
            status: "active",
          })
        }
      )
    )

    const result = await activateOwnerSegmentationVersion(
      "d69f2ce3-03f7-4cd6-ae98-9c9dc95511ce"
    )

    expect(calls).toBe(1)
    expect(result.status).toBe("active")
  })

  it("lists owner workspaces and versions with query mapping", async () => {
    let seenCreateWorkspaceBody: unknown = null
    let seenSurahParam: string | null = null

    server.use(
      http.post(`${API_URL}${SEGMENTATION_PATHS.workspaces}`, async ({ request }) => {
        seenCreateWorkspaceBody = await request.json()
        return HttpResponse.json(
          {
            ...SAMPLE_WORKSPACE,
            id: 8,
            slug: "private-workspace",
            visibility: "private",
            is_featured: false,
          },
          { status: 201 }
        )
      }),
      http.get(
        `${API_URL}/api/v1/segmentation/workspaces/:slug/segmentation-versions/`,
        ({ request }) => {
          seenSurahParam = new URL(request.url).searchParams.get("surah")
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [SAMPLE_VERSION],
          })
        }
      )
    )

    const workspace = await createOwnerWorkspace({
      title: "Private Workspace",
      description: "mine",
    })

    const versions = await listOwnerWorkspaceSegmentationVersions({
      slug: "private-workspace",
      surah: 2,
    })

    expect(seenCreateWorkspaceBody).toEqual({
      title: "Private Workspace",
      description: "mine",
    })
    expect(workspace.visibility).toBe("private")
    expect(seenSurahParam).toBe("2")
    expect(versions).toHaveLength(1)
  })

  it("loads public segments and tag inventory by version id", async () => {
    let segmentsCalls = 0
    let tagsCalls = 0

    server.use(
      http.get(
        `${API_URL}/api/v1/segmentation/public/segmentation-versions/:publicId/segments/`,
        () => {
          segmentsCalls += 1
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 9,
                public_id: "segment-1",
                start_ayah: 2001,
                end_ayah: 2002,
                title: "Block",
                summary: "",
                origin: "ai",
                tags: [],
              },
            ],
          })
        }
      ),
      http.get(
        `${API_URL}/api/v1/segmentation/public/segmentation-versions/:publicId/tags/`,
        () => {
          tagsCalls += 1
          return HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 3,
                public_id: "tag-1",
                workspace: 1,
                name: "Mercy",
                color: "#22c55e",
                description: "",
                origin: "ai",
              },
            ],
          })
        }
      )
    )

    const [segments, tags] = await Promise.all([
      listPublicSegmentationVersionSegments(SAMPLE_VERSION.public_id),
      listPublicSegmentationVersionTags(SAMPLE_VERSION.public_id),
    ])

    expect(segmentsCalls).toBe(1)
    expect(tagsCalls).toBe(1)
    expect(segments).toHaveLength(1)
    expect(tags).toHaveLength(1)
    expect(tags[0]?.name).toBe("Mercy")
  })

  it("loads owner workspaces, segments, tags, and posts create-tag payload", async () => {
    let seenTagBody: unknown = null

    server.use(
      http.get(`${API_URL}${SEGMENTATION_PATHS.workspaces}`, () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              ...SAMPLE_WORKSPACE,
              visibility: "private",
              is_featured: false,
            },
          ],
        })
      ),
      http.get(
        `${API_URL}/api/v1/segmentation/segmentation-versions/:publicId/segments/`,
        () =>
          HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 12,
                public_id: "owner-segment",
                start_ayah: 2001,
                end_ayah: 2003,
                title: "Owner block",
                summary: "",
                origin: "user",
                tags: [],
              },
            ],
          })
      ),
      http.get(`${API_URL}/api/v1/segmentation/workspaces/:slug/tags/`, () =>
        HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 99,
              public_id: "owner-tag",
              workspace: 1,
              name: "Creation",
              color: "#14b8a6",
              description: "",
              origin: "user",
            },
          ],
        })
      ),
      http.post(`${API_URL}/api/v1/segmentation/workspaces/:slug/tags/`, async ({ request }) => {
        seenTagBody = await request.json()
        return HttpResponse.json(
          {
            id: 100,
            public_id: "new-owner-tag",
            workspace: 1,
            name: "Patience",
            color: "#0ea5e9",
            description: "note",
            origin: "user",
          },
          { status: 201 }
        )
      })
    )

    const [workspaces, segments, tags, createdTag] = await Promise.all([
      listOwnerWorkspaces(),
      listOwnerSegmentationVersionSegments(SAMPLE_VERSION.public_id),
      listOwnerWorkspaceTags("private-workspace"),
      createOwnerWorkspaceTag("private-workspace", {
        name: "Patience",
        color: "#0ea5e9",
        description: "note",
      }),
    ])

    expect(workspaces).toHaveLength(1)
    expect(segments).toHaveLength(1)
    expect(tags).toHaveLength(1)
    expect(createdTag.public_id).toBe("new-owner-tag")
    expect(seenTagBody).toEqual({
      name: "Patience",
      color: "#0ea5e9",
      description: "note",
    })
  })
})
