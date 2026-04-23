import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterAll, afterEach, beforeAll, vi } from "vitest"

import enMessages from "@/i18n/messages/en.json"

import { server } from "./msw/server"

vi.mock("next-intl/server", async () => {
  const { createTranslator } =
    await vi.importActual<typeof import("next-intl")>("next-intl")
  return {
    getLocale: async () => "en",
    getMessages: async () => enMessages,
    getTranslations: async (namespace?: unknown) =>
      createTranslator({
        locale: "en",
        messages: enMessages,
        // createTranslator accepts an optional namespace string; the app's
        // typed overloads aren't reachable through the mocked module, so
        // the safe path is to pass it through untyped.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        namespace: namespace as any,
      }),
  }
})

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
