import { describe, expect, it } from "vitest"

import {
  blockHeading,
  isSurahDistributionPayload,
  isTextPayload,
} from "@/features/search/blocks/block-types"
import type { SearchResponseBlock } from "@/services/search"

const baseBlock: Omit<SearchResponseBlock, "block_type" | "payload"> = {
  id: 1,
  order: 0,
  title: "",
  explanation: "",
  confidence: null,
  provenance: {},
  warning_text: "",
  items: [],
}

describe("block payload guards", () => {
  it("isTextPayload accepts a valid text payload", () => {
    expect(isTextPayload({ details: "hello" })).toBe(true)
    expect(isTextPayload({ details: "x", headline: "y" })).toBe(true)
  })

  it("isTextPayload rejects malformed input", () => {
    expect(isTextPayload(null)).toBe(false)
    expect(isTextPayload({})).toBe(false)
    expect(isTextPayload({ details: 123 })).toBe(false)
  })

  it("isSurahDistributionPayload accepts a valid distribution", () => {
    expect(
      isSurahDistributionPayload({
        values: [
          { surah: 1, value: 3 },
          { surah: 2, value: 5 },
        ],
      })
    ).toBe(true)
  })

  it("isSurahDistributionPayload rejects malformed input", () => {
    expect(isSurahDistributionPayload(null)).toBe(false)
    expect(isSurahDistributionPayload({ values: "not array" })).toBe(false)
    expect(
      isSurahDistributionPayload({ values: [{ surah: "1", value: 5 }] })
    ).toBe(false)
  })
})

describe("blockHeading", () => {
  it("prefers block.title", () => {
    const block: SearchResponseBlock = {
      ...baseBlock,
      block_type: "text",
      title: "primary",
      payload: { headline: "secondary", details: "x" },
    }
    expect(blockHeading(block)).toBe("primary")
  })

  it("falls back to payload.headline when title is empty", () => {
    const block: SearchResponseBlock = {
      ...baseBlock,
      block_type: "text",
      title: "",
      payload: { headline: "fallback", details: "x" },
    }
    expect(blockHeading(block)).toBe("fallback")
  })

  it("returns empty string when both are missing", () => {
    const block: SearchResponseBlock = {
      ...baseBlock,
      block_type: "text",
      title: "",
      payload: { details: "x" },
    }
    expect(blockHeading(block)).toBe("")
  })
})
