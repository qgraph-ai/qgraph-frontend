import type { RevelationPlace } from "@/services/quran"

export function RevelationBadge({
  place,
  label,
}: {
  place: RevelationPlace
  label: string
}) {
  return (
    <span
      data-place={place}
      className="text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground"
    >
      {label}
    </span>
  )
}
