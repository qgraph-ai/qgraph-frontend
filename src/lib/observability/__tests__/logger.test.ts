import { afterEach, describe, expect, it, vi } from "vitest"

import { logger } from "@/lib/observability/logger"

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("filters logs below configured level", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {})

    logger.debug("Hidden debug log")

    expect(debugSpy).not.toHaveBeenCalled()
  })

  it("redacts sensitive keys in metadata", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    logger.warn("Auth failure", {
      email: "user@example.com",
      token: "secret-token",
      nested: { password: "secret", ok: true },
    })

    expect(warnSpy).toHaveBeenCalledTimes(1)
    const payload = warnSpy.mock.calls[0]?.[1] as Record<string, unknown>
    expect(payload.email).toBe("[REDACTED]")
    expect(payload.token).toBe("[REDACTED]")
    expect(payload.nested).toEqual({ password: "[REDACTED]", ok: true })
  })

  it("logs with and without metadata at supported levels", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    logger.info("Simple info")
    logger.error("Complex failure", {
      list: [{ token: "secret" }],
      nested: { a: { b: { c: { d: { tooDeep: true } } } } },
    })

    expect(infoSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy.mock.calls[0]?.[1]).toMatchObject({
      list: [{ token: "[REDACTED]" }],
    })
  })
})
