import { beforeEach, describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"

import { renderWithProviders, screen, waitFor } from "../../../../../tests/test-utils"

const {
  useAuthMock,
  listOwnerWorkspacesMock,
  listOwnerVersionsMock,
  listOwnerSegmentsMock,
  listOwnerTagsMock,
  createOwnerWorkspaceMock,
  createOwnerVersionMock,
  createOwnerTagMock,
  saveSnapshotMock,
  activateVersionMock,
  getAllSurahAyahsMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  listOwnerWorkspacesMock: vi.fn(),
  listOwnerVersionsMock: vi.fn(),
  listOwnerSegmentsMock: vi.fn(),
  listOwnerTagsMock: vi.fn(),
  createOwnerWorkspaceMock: vi.fn(),
  createOwnerVersionMock: vi.fn(),
  createOwnerTagMock: vi.fn(),
  saveSnapshotMock: vi.fn(),
  activateVersionMock: vi.fn(),
  getAllSurahAyahsMock: vi.fn(),
}))

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}))

vi.mock("@/features/auth/use-auth", () => ({
  useAuth: useAuthMock,
}))

vi.mock("@/services/quran", () => ({
  getAllSurahAyahs: getAllSurahAyahsMock,
}))

vi.mock("@/services/segmentation", () => ({
  listOwnerWorkspaces: listOwnerWorkspacesMock,
  listOwnerWorkspaceSegmentationVersions: listOwnerVersionsMock,
  listOwnerSegmentationVersionSegments: listOwnerSegmentsMock,
  listOwnerWorkspaceTags: listOwnerTagsMock,
  createOwnerWorkspace: createOwnerWorkspaceMock,
  createOwnerWorkspaceSegmentationVersion: createOwnerVersionMock,
  createOwnerWorkspaceTag: createOwnerTagMock,
  saveOwnerSegmentationVersionSnapshot: saveSnapshotMock,
  activateOwnerSegmentationVersion: activateVersionMock,
}))

import { MySegmentationPanel } from "@/features/segmentation/components/my-segmentation-panel"

const SURAHS = [
  {
    number: 2,
    arabic_name: "ٱلْبَقَرَة",
    transliteration: "Al-Baqarah",
    english_name: "The Cow",
    ayah_count: 286,
    revelation_place: "medinan" as const,
  },
]

describe("MySegmentationPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading shell while auth state is pending", () => {
    useAuthMock.mockReturnValue({ status: "loading", user: null })

    renderWithProviders(
      <MySegmentationPanel
        surahs={SURAHS}
        publicForkSourceVersion={null}
        defaultSurahNumber={2}
      />
    )

    expect(screen.getByText("Editor")).toBeInTheDocument()
  })

  it("shows sign-in prompt for guests", () => {
    useAuthMock.mockReturnValue({ status: "unauthenticated", user: null })

    renderWithProviders(
      <MySegmentationPanel
        surahs={SURAHS}
        publicForkSourceVersion={null}
        defaultSurahNumber={2}
      />
    )

    expect(screen.getByRole("link", { name: "Sign in to edit" })).toHaveAttribute(
      "href",
      "/auth/sign-in?next=%2Fsegmentation"
    )
  })

  it("supports editing and save-snapshot mapping for authenticated users", async () => {
    const user = userEvent.setup()

    useAuthMock.mockReturnValue({ status: "authenticated", user: { id: 1 } })

    listOwnerWorkspacesMock.mockResolvedValue([
      {
        id: 1,
        slug: "mine",
        title: "Mine",
        description: "",
        visibility: "private",
        is_featured: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ])

    listOwnerVersionsMock.mockResolvedValue([
      {
        id: 2,
        public_id: "owner-version",
        workspace: 1,
        surah: 2,
        title: "Draft",
        status: "draft",
        origin: "user",
        base_version: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ])

    listOwnerSegmentsMock.mockResolvedValue([
      {
        id: 2,
        public_id: "segment-a",
        start_ayah: 2001,
        end_ayah: 2003,
        title: "Block",
        summary: "Summary",
        origin: "user",
        tags: [],
      },
    ])

    listOwnerTagsMock.mockResolvedValue([])

    getAllSurahAyahsMock.mockResolvedValue([
      {
        number_global: 2001,
        surah_number: 2,
        number_in_surah: 1,
        text_ar: "a",
        translation: "",
      },
      {
        number_global: 2002,
        surah_number: 2,
        number_in_surah: 2,
        text_ar: "b",
        translation: "",
      },
      {
        number_global: 2003,
        surah_number: 2,
        number_in_surah: 3,
        text_ar: "c",
        translation: "",
      },
    ])

    saveSnapshotMock.mockResolvedValue({
      id: 3,
      public_id: "owner-version-2",
      workspace: 1,
      surah: 2,
      title: "Draft",
      status: "draft",
      origin: "user",
      base_version: 2,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    })

    renderWithProviders(
      <MySegmentationPanel
        surahs={SURAHS}
        publicForkSourceVersion={null}
        defaultSurahNumber={2}
      />
    )

    await waitFor(() => {
      expect(screen.getByText("Ayah #1 to #3")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Split" }))

    await waitFor(() => {
      expect(screen.getByText("Ayah #1 to #2")).toBeInTheDocument()
      expect(screen.getByText("Ayah #3 to #3")).toBeInTheDocument()
    })

    await user.click(screen.getByRole("button", { name: "Save snapshot" }))

    await waitFor(() => {
      expect(saveSnapshotMock).toHaveBeenCalledTimes(1)
    })

    const [, payload] = saveSnapshotMock.mock.calls[0]
    expect(payload).toMatchObject({
      title: "Draft",
      segments: [
        { start_ayah: 2001, end_ayah: 2002 },
        { start_ayah: 2003, end_ayah: 2003 },
      ],
    })
  })

  it("supports workspace creation, tag creation, fork, scratch, and activation actions", async () => {
    const user = userEvent.setup()

    useAuthMock.mockReturnValue({ status: "authenticated", user: { id: 1 } })

    listOwnerWorkspacesMock.mockResolvedValue([
      {
        id: 1,
        slug: "mine",
        title: "Mine",
        description: "",
        visibility: "private",
        is_featured: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ])

    listOwnerVersionsMock.mockResolvedValue([
      {
        id: 2,
        public_id: "owner-version",
        workspace: 1,
        surah: 2,
        title: "Draft",
        status: "draft",
        origin: "user",
        base_version: null,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ])

    listOwnerSegmentsMock.mockResolvedValue([])
    listOwnerTagsMock.mockResolvedValue([
      {
        id: 8,
        public_id: "tag-1",
        workspace: 1,
        name: "Patience",
        color: "#22c55e",
        description: "",
        origin: "user",
      },
    ])

    getAllSurahAyahsMock.mockResolvedValue([
      {
        number_global: 2001,
        surah_number: 2,
        number_in_surah: 1,
        text_ar: "a",
        translation: "",
      },
      {
        number_global: 2002,
        surah_number: 2,
        number_in_surah: 2,
        text_ar: "b",
        translation: "",
      },
      {
        number_global: 2003,
        surah_number: 2,
        number_in_surah: 3,
        text_ar: "c",
        translation: "",
      },
    ])

    createOwnerWorkspaceMock.mockResolvedValue({
      id: 9,
      slug: "new-workspace",
      title: "New Workspace",
      description: "desc",
      visibility: "private",
      is_featured: false,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    })

    createOwnerVersionMock.mockResolvedValue({
      id: 3,
      public_id: "owner-version-new",
      workspace: 1,
      surah: 2,
      title: "Draft",
      status: "draft",
      origin: "user",
      base_version: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    })

    createOwnerTagMock.mockResolvedValue({
      id: 10,
      public_id: "tag-new",
      workspace: 1,
      name: "Hope",
      color: "#22c55e",
      description: "",
      origin: "user",
    })

    activateVersionMock.mockResolvedValue({
      id: 2,
      public_id: "owner-version",
      workspace: 1,
      surah: 2,
      title: "Draft",
      status: "active",
      origin: "user",
      base_version: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    })

    renderWithProviders(
      <MySegmentationPanel
        surahs={SURAHS}
        publicForkSourceVersion={{
          id: 31,
          public_id: "public-version",
          workspace: 99,
          surah: 2,
          title: "Public v1",
          status: "active",
          origin: "ai",
          base_version: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        }}
        defaultSurahNumber={2}
      />
    )

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Mine" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Create scratch draft" })).toBeInTheDocument()
    })

    await user.click(screen.getByText("Create workspace", { selector: "summary" }))
    await user.type(screen.getByPlaceholderText("Workspace title"), "Workspace X")
    await user.type(screen.getByPlaceholderText("Short description"), "test")
    await user.click(screen.getAllByRole("button", { name: "Create workspace" })[0]!)

    await waitFor(() => {
      expect(createOwnerWorkspaceMock.mock.calls[0]?.[0]).toEqual({
        title: "Workspace X",
        description: "test",
      })
    })

    await user.click(screen.getByText("Workspace tags", { selector: "summary" }))
    await user.type(screen.getByPlaceholderText("Tag name"), "Hope")
    await user.type(screen.getByPlaceholderText("Optional description"), "desc")
    await user.click(screen.getByRole("button", { name: "Create tag" }))

    await waitFor(() => {
      expect(createOwnerTagMock).toHaveBeenCalledWith(
        "mine",
        expect.objectContaining({
          name: "Hope",
        })
      )
    })

    await user.click(screen.getByRole("button", { name: "Create scratch draft" }))
    await user.click(screen.getByRole("button", { name: "Fork selected public version" }))
    await user.click(screen.getByRole("button", { name: "Activate version" }))

    await waitFor(() => {
      expect(createOwnerVersionMock).toHaveBeenCalledTimes(2)
      expect(createOwnerVersionMock).toHaveBeenNthCalledWith(
        1,
        "mine",
        expect.objectContaining({ surah: 2 })
      )
      expect(createOwnerVersionMock).toHaveBeenNthCalledWith(
        2,
        "mine",
        expect.objectContaining({
          base_version_public_id: "public-version",
        })
      )
      expect(activateVersionMock).toHaveBeenCalledTimes(1)
    })
  })
})
