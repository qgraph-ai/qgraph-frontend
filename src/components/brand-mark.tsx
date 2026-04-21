import { cn } from "@/lib/utils"

export function BrandOrnament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" />
      <path d="M12 4.5 L13.6 9.5 L19 12 L13.6 14.5 L12 19.5 L10.4 14.5 L5 12 L10.4 9.5 Z" opacity="0.5" />
    </svg>
  )
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("text-base font-semibold tracking-tight", className)}>
      QGraph
    </span>
  )
}
