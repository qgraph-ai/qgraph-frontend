import { describe, expect, it } from "vitest"

import {
  isTerminalStatus,
  TERMINAL_EXECUTION_STATUSES,
} from "@/services/search/types"

describe("isTerminalStatus", () => {
  it("returns true for every terminal status", () => {
    for (const status of TERMINAL_EXECUTION_STATUSES) {
      expect(isTerminalStatus(status)).toBe(true)
    }
  })

  it("returns false for non-terminal statuses", () => {
    expect(isTerminalStatus("pending")).toBe(false)
    expect(isTerminalStatus("queued")).toBe(false)
    expect(isTerminalStatus("running")).toBe(false)
  })

  it("returns false for empty / nullish input", () => {
    expect(isTerminalStatus(null)).toBe(false)
    expect(isTerminalStatus(undefined)).toBe(false)
  })
})
