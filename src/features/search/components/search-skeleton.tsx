import { Skeleton } from "@/components/ui/skeleton"

export function SearchSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-live="polite">
      <Skeleton className="h-7 w-2/3 rounded-lg" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  )
}
