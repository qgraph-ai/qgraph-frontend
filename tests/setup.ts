import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterAll, afterEach, beforeAll, vi } from "vitest"

import { server } from "./msw/server"

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<object>("next/navigation")
  return {
    ...actual,
    useRouter: () => mockRouter,
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
  }
})

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  mockRouter.push.mockReset()
  mockRouter.replace.mockReset()
  mockRouter.back.mockReset()
  mockRouter.forward.mockReset()
  mockRouter.refresh.mockReset()
  mockRouter.prefetch.mockReset()
})

afterAll(() => {
  server.close()
})
