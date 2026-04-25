import { describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"

import { renderWithProviders, screen, waitFor } from "../../../../../tests/test-utils"

const {
  listPublicWorkspacesMock,
  listPublicVersionsMock,
  listPublicSegmentsMock,
  listPublicTagsMock,
} = vi.hoisted(() => ({
  listPublicWorkspacesMock: vi.fn(),
  listPublicVersionsMock: vi.fn(),
  listPublicSegmentsMock: vi.fn(),
  listPublicTagsMock: vi.fn(),
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}))

vi.mock("@/services/segmentation", () => ({
  listPublicWorkspaces: listPublicWorkspacesMock,
  listPublicSegmentationVersions: listPublicVersionsMock,
  listPublicSegmentationVersionSegments: listPublicSegmentsMock,
  listPublicSegmentationVersionTags: listPublicTagsMock,
}))

import { PublicSegmentationPanel } from "@/features/segmentation/components/public-segmentation-panel"

describe("PublicSegmentationPanel", () => {
  it("renders public segments and forwards status filter changes", async () => {
    const user = userEvent.setup()

    listPublicWorkspacesMock.mockResolvedValue([
      {
        id: 1,
        slug: "featured",
        title: "Featured",
        description: "",
        visibility: "public",
        is_featured: true,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ])

    listPublicVersionsMock.mockResolvedValue([
      {
        id: 1,
        public_id: "version-1",
        workspace: 1,
        surah: 1,
        title: "Active v1",
        status: "active",
        origin: "ai",
        base_version: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ])

    listPublicSegmentsMock.mockResolvedValue([
      {
        id: 1,
        public_id: "segment-1",
        start_ayah: 1001,
        end_ayah: 1004,
        title: "Opening",
        summary: "Summary",
        origin: "ai",
        tags: [
          {
            id: 7,
            public_id: "tag-1",
            workspace: 1,
            name: "Mercy",
            color: "#22c55e",
            description: "",
            origin: "ai",
          },
        ],
      },
    ])

    listPublicTagsMock.mockResolvedValue([
      {
        id: 7,
        public_id: "tag-1",
        workspace: 1,
        name: "Mercy",
        color: "#22c55e",
        description: "",
        origin: "ai",
      },
    ])

    const onPublicVersionSelected = vi.fn()

    renderWithProviders(
      <PublicSegmentationPanel
        initialWorkspaces={[
          {
            id: 1,
            slug: "featured",
            title: "Featured",
            description: "",
            visibility: "public",
            is_featured: true,
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ]}
        initialWorkspaceSlug="featured"
        surahs={[
          {
            number: 1,
            arabic_name: "ٱلْفَاتِحَة",
            transliteration: "Al-Fātiḥah",
            english_name: "The Opening",
            ayah_count: 7,
            revelation_place: "meccan",
          },
        ]}
        onPublicVersionSelected={onPublicVersionSelected}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Ayah 1 to 4")).toBeInTheDocument()
      expect(screen.getByText("Opening")).toBeInTheDocument()
      expect(screen.getAllByText("Mercy").length).toBeGreaterThan(0)
    })

    await user.selectOptions(screen.getByLabelText("Status filter"), "archived")

    await waitFor(() => {
      expect(listPublicVersionsMock).toHaveBeenLastCalledWith({
        slug: "featured",
        surah: 1,
        status: "archived",
      })
    })

    expect(onPublicVersionSelected).toHaveBeenCalled()
  })
})
