"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState, type CSSProperties } from "react"

import { hexToSegmentColors } from "@/lib/color"
import { cn } from "@/lib/utils"

import type { SpineItem } from "../lib/spine-items"

const ACTIVE_INTERSECTION_MARGIN = "-30% 0px -60% 0px"

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function scrollToTarget(targetId: string) {
  const el = typeof document !== "undefined"
    ? document.getElementById(targetId)
    : null
  if (!el) return
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  })
}

export function ThemeSpine({ items }: { items: SpineItem[] }) {
  const t = useTranslations("segmentation.spine")
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0) return
    if (typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: ACTIVE_INTERSECTION_MARGIN, threshold: [0, 0.25, 0.75, 1] }
    )

    for (const item of items) {
      const el = document.getElementById(item.targetId)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav
      aria-label={t("label")}
      className="pointer-events-none fixed inset-inline-end-3 top-1/2 z-30 hidden h-[70vh] max-h-[70vh] -translate-y-1/2 md:block"
    >
      <div className="pointer-events-auto flex h-full flex-col items-end">
        {items.map((item) => {
          const isActive = activeId === item.targetId
          const baseClass = cn(
            "group relative w-2.5 min-h-[3px] rounded-sm bg-muted/60 outline-none",
            "data-[tinted]:border data-[tinted]:border-solid",
            "data-[tinted]:bg-[var(--seg-tint-light)]",
            "data-[tinted]:border-[var(--seg-border-light)]",
            "dark:data-[tinted]:bg-[var(--seg-tint-dark)]",
            "dark:data-[tinted]:border-[var(--seg-border-dark)]",
            "motion-safe:transition-[width] motion-safe:duration-200 motion-safe:ease-out",
            "data-[active]:w-4 data-[active]:ring-1 data-[active]:ring-foreground/40",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          )

          if (item.kind === "segment") {
            const palette = hexToSegmentColors(item.color)
            const tinted = palette !== null
            const style: CSSProperties = palette
              ? ({
                  flexGrow: item.chars,
                  "--seg-tint-light": palette.tintLight,
                  "--seg-tint-dark": palette.tintDark,
                  "--seg-border-light": palette.borderLight,
                  "--seg-border-dark": palette.borderDark,
                } as CSSProperties)
              : { flexGrow: item.chars }
            const displayTitle = item.title.trim()
              ? item.title
              : t("untitled", { number: item.index })
            const ariaLabel = t("jumpTo", { title: displayTitle })

            return (
              <button
                key={item.targetId}
                type="button"
                aria-label={ariaLabel}
                aria-current={isActive ? "location" : undefined}
                data-spine-slice
                data-tinted={tinted ? "" : undefined}
                data-active={isActive ? "" : undefined}
                style={style}
                onClick={() => scrollToTarget(item.targetId)}
                className={baseClass}
              >
                <SpineTooltip
                  title={displayTitle}
                  range={`${item.rangeStart}–${item.rangeEnd}`}
                />
              </button>
            )
          }

          const gapLabel = t("gapLabel", {
            start: item.rangeStart,
            end: item.rangeEnd,
          })
          return (
            <button
              key={item.targetId}
              type="button"
              aria-label={gapLabel}
              aria-current={isActive ? "location" : undefined}
              data-spine-slice
              data-active={isActive ? "" : undefined}
              style={{ flexGrow: item.chars }}
              onClick={() => scrollToTarget(item.targetId)}
              className={baseClass}
            >
              <SpineTooltip title={gapLabel} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function SpineTooltip({
  title,
  range,
}: {
  title: string
  range?: string
}) {
  return (
    <span
      role="presentation"
      className={cn(
        "pointer-events-none absolute top-1/2 inset-inline-end-full me-2 -translate-y-1/2",
        "whitespace-nowrap rounded-md border border-border/60 bg-popover px-2 py-1",
        "text-xs text-popover-foreground shadow-md",
        "opacity-0 transition-opacity duration-150",
        "group-hover:opacity-100 group-focus-visible:opacity-100"
      )}
    >
      <span className="block max-w-56 truncate">{title}</span>
      {range ? (
        <span className="block text-[0.65rem] tracking-tight text-muted-foreground">
          {range}
        </span>
      ) : null}
    </span>
  )
}
