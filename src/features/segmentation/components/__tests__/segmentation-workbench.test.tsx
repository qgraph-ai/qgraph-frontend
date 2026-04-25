import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
}))

vi.mock("@/features/auth/use-auth", () => ({
  useAuth: useAuthMock,
}))

vi.mock("@/features/segmentation/components/public-segmentation-panel", () => ({
  PublicSegmentationPanel: ({ onPublicVersionSelected }: { onPublicVersionSelected: (value: unknown) => void }) => (
    <div>
      <div data-testid="public-panel">Public panel</div>
      <button type="button" onClick={() => onPublicVersionSelected({ public_id: "v1", surah: 1 })}>
        Select public version
      </button>
    </div>
  ),
}))

vi.mock("@/features/segmentation/components/my-segmentation-panel", () => ({
  MySegmentationPanel: () => <div data-testid="editor-panel">Editor panel</div>,
}))

import { SegmentationWorkbench } from "@/features/segmentation/components/segmentation-workbench"

const SURAHS = [
  {
    number: 1,
    arabic_name: "ٱلْفَاتِحَة",
    transliteration: "Al-Fātiḥah",
    english_name: "The Opening",
    ayah_count: 7,
    revelation_place: "meccan" as const,
  },
]

const WORKSPACES = [
  {
    id: 1,
    slug: "featured",
    title: "Featured",
    description: "",
    visibility: "public" as const,
    is_featured: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
]

describe("SegmentationWorkbench", () => {
  it("shows public preview and sign-in button for guests", () => {
    useAuthMock.mockReturnValue({ status: "unauthenticated", user: null })

    renderWithProviders(
      <SegmentationWorkbench
        initialWorkspaces={WORKSPACES}
        featuredWorkspace={WORKSPACES[0]}
        surahs={SURAHS}
      />
    )

    expect(screen.getByTestId("public-panel")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Sign in to edit" })).toHaveAttribute(
      "href",
      "/auth/sign-in?next=%2Fsegmentation"
    )
    expect(screen.queryByTestId("editor-panel")).not.toBeInTheDocument()
  })

  it("starts authenticated users in preview and opens tabs only on demand", async () => {
    const user = userEvent.setup()
    useAuthMock.mockReturnValue({ status: "authenticated", user: { id: 1 } })

    renderWithProviders(
      <SegmentationWorkbench
        initialWorkspaces={WORKSPACES}
        featuredWorkspace={WORKSPACES[0]}
        surahs={SURAHS}
      />
    )

    expect(screen.getByTestId("public-panel")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Open editor" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Preview" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Editor" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Open editor" }))

    expect(screen.getByRole("button", { name: "Preview" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Editor" })).toBeInTheDocument()
    expect(screen.getByTestId("editor-panel")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Preview" }))
    expect(screen.getByTestId("public-panel")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Close editor" }))
    expect(screen.queryByRole("button", { name: "Preview" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Open editor" })).toBeInTheDocument()
  })
})
