import { describe, expect, it } from "vitest"

import { padSurahNumber, toArabicDigits } from "../format"

describe("toArabicDigits", () => {
  it("maps single-digit Latin to Arabic-Indic", () => {
    expect(toArabicDigits(0)).toBe("٠")
    expect(toArabicDigits(7)).toBe("٧")
    expect(toArabicDigits(9)).toBe("٩")
  })

  it("maps multi-digit numbers", () => {
    expect(toArabicDigits(12)).toBe("١٢")
    expect(toArabicDigits(286)).toBe("٢٨٦")
    expect(toArabicDigits(6236)).toBe("٦٢٣٦")
  })
})

describe("padSurahNumber", () => {
  it("zero-pads to three digits", () => {
    expect(padSurahNumber(1)).toBe("001")
    expect(padSurahNumber(9)).toBe("009")
    expect(padSurahNumber(42)).toBe("042")
  })

  it("leaves three-digit numbers unchanged", () => {
    expect(padSurahNumber(114)).toBe("114")
  })
})
