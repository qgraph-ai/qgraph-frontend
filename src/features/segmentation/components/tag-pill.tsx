"use client"

import { useTheme } from "next-themes"

import { buildColorTokens, normalizeHexColor } from "@/features/segmentation/lib/color"

export function TagPill({
  name,
  color,
  compact = false,
}: {
  name: string
  color: string
  compact?: boolean
}) {
  const { resolvedTheme } = useTheme()
  const theme = resolvedTheme === "dark" ? "dark" : "light"
  const tokens = buildColorTokens(color, theme)

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${
        compact ? "px-2 py-0.5 text-[0.67rem]" : "px-2.5 py-1 text-xs"
      }`}
      style={{
        color: tokens.foreground,
        backgroundColor: tokens.background,
        borderColor: tokens.border,
      }}
      data-tag-color={normalizeHexColor(color)}
      title={`${name} (${normalizeHexColor(color)})`}
    >
      {name}
    </span>
  )
}
