import { act, fireEvent } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { SpineItem } from "../../lib/spine-items"
import { ThemeSpine } from "../theme-spine"

import { renderWithProviders, screen } from "../../../../../tests/test-utils"

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void

let observerCallback: ObserverCallback | null = null
let observedEls: Element[] = []

class FakeIntersectionObserver implements IntersectionObserver {
  readonly root: Document | Element | null = null
  readonly rootMargin = ""
  readonly thresholds: number[] = []

  constructor(cb: IntersectionObserverCallback) {
    observerCallback = (entries) => cb(entries, this)
  }
  observe(el: Element) {
    observedEls.push(el)
  }
  unobserve() {}
  disconnect() {
    observedEls = []
    observerCallback = null
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

function fakeEntry(el: Element, ratio: number): IntersectionObserverEntry {
  return {
    target: el,
    isIntersecting: ratio > 0,
    intersectionRatio: ratio,
    boundingClientRect: el.getBoundingClientRect(),
    intersectionRect: el.getBoundingClientRect(),
    rootBounds: null,
    time: 0,
  } as IntersectionObserverEntry
}

function segmentItem(
  publicId: string,
  partial: Partial<Extract<SpineItem, { kind: "segment" }>> = {}
): SpineItem {
  return {
    kind: "segment",
    targetId: `segment-${publicId}`,
    index: 1,
    chars: 100,
    color: "#22c55e",
    title: "",
    rangeStart: 1,
    rangeEnd: 3,
    ...partial,
  }
}

function gapItem(global: number, chars = 50): SpineItem {
  return {
    kind: "gap",
    targetId: `gap-${global}`,
    chars,
    rangeStart: 1,
    rangeEnd: 1,
  }
}

describe("ThemeSpine", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ""
    observedEls = []
    observerCallback = null
  })

  it("returns null when there are no items", () => {
    const { container } = renderWithProviders(<ThemeSpine items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders one button per spine item with localized aria labels", () => {
    renderWithProviders(
      <ThemeSpine
        items={[
          segmentItem("a", { title: "The story of Adam" }),
          segmentItem("b", { title: "", index: 2 }),
          gapItem(700),
        ]}
      />
    )

    expect(
      screen.getByRole("button", { name: /jump to the story of adam/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /jump to segment 2/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /uncovered ayahs/i })
    ).toBeInTheDocument()
  })

  it("scrolls to the matching DOM target on click", () => {
    const target = document.createElement("article")
    target.id = "segment-abc"
    const scrollSpy = vi.fn()
    target.scrollIntoView = scrollSpy
    document.body.appendChild(target)

    renderWithProviders(
      <ThemeSpine
        items={[segmentItem("abc", { title: "Adam" })]}
      />
    )
    const btn = screen.getByRole("button", { name: /jump to adam/i })
    fireEvent.click(btn)

    expect(scrollSpy).toHaveBeenCalledTimes(1)
    expect(scrollSpy).toHaveBeenCalledWith(
      expect.objectContaining({ block: "start" })
    )
  })

  it("registers an IntersectionObserver against each card present in the DOM", () => {
    const a = document.createElement("article")
    a.id = "segment-a"
    document.body.appendChild(a)
    const b = document.createElement("article")
    b.id = "segment-b"
    document.body.appendChild(b)

    renderWithProviders(
      <ThemeSpine
        items={[
          segmentItem("a", { title: "first" }),
          segmentItem("b", { title: "second" }),
        ]}
      />
    )

    expect(observedEls).toHaveLength(2)
    expect(observedEls.map((el) => (el as HTMLElement).id)).toEqual([
      "segment-a",
      "segment-b",
    ])
  })

  it("marks the most-visible target as active when the observer fires", () => {
    const a = document.createElement("article")
    a.id = "segment-a"
    document.body.appendChild(a)
    const b = document.createElement("article")
    b.id = "segment-b"
    document.body.appendChild(b)

    renderWithProviders(
      <ThemeSpine
        items={[
          segmentItem("a", { title: "first" }),
          segmentItem("b", { title: "second" }),
        ]}
      />
    )

    expect(observerCallback).not.toBeNull()
    act(() => {
      observerCallback!([fakeEntry(a, 0.2), fakeEntry(b, 0.8)])
    })

    const btnB = screen.getByRole("button", { name: /jump to second/i })
    expect(btnB).toHaveAttribute("aria-current", "location")
    expect(btnB).toHaveAttribute("data-active", "")

    const btnA = screen.getByRole("button", { name: /jump to first/i })
    expect(btnA).not.toHaveAttribute("aria-current")
    expect(btnA).not.toHaveAttribute("data-active")
  })

  it("hides itself from small viewports via the md: breakpoint class", () => {
    renderWithProviders(
      <ThemeSpine items={[segmentItem("a", { title: "Adam" })]} />
    )
    const nav = screen.getByRole("navigation", { name: /theme spine/i })
    expect(nav.className).toMatch(/\bhidden\b/)
    expect(nav.className).toMatch(/\bmd:block\b/)
  })
})
