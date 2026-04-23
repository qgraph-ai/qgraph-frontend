import { describe, expect, it } from "vitest"

import { parseSurahNumber } from "../parse"

describe("parseSurahNumber", () => {
  it("accepts valid numbers in range 1..114", () => {
    expect(parseSurahNumber("1")).toBe(1)
    expect(parseSurahNumber("50")).toBe(50)
    expect(parseSurahNumber("114")).toBe(114)
  })

  it("rejects numbers out of range", () => {
    expect(parseSurahNumber("0")).toBeNull()
    expect(parseSurahNumber("115")).toBeNull()
    expect(parseSurahNumber("9999")).toBeNull()
  })

  it("rejects non-numeric input", () => {
    expect(parseSurahNumber("abc")).toBeNull()
    expect(parseSurahNumber("")).toBeNull()
    expect(parseSurahNumber("1.5")).toBeNull()
    expect(parseSurahNumber("-1")).toBeNull()
    expect(parseSurahNumber("1a")).toBeNull()
  })
})
