"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useTransition } from "react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { SegmentationVersion } from "@/services/segmentation"

const VERSION_PARAM = "v"
const SELECT_ID = "segmentation-version-picker"

export function VersionPicker({
  versions,
  currentPublicId,
}: {
  versions: SegmentationVersion[]
  currentPublicId: string
}) {
  const t = useTranslations("segmentation.reader")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  if (versions.length <= 1) return null

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(VERSION_PARAM, next)
    const query = params.toString()
    startTransition(() => {
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false })
    })
  }

  return (
    <div className="mx-auto mb-6 flex max-w-2xl items-center justify-end gap-2">
      <Label
        htmlFor={SELECT_ID}
        className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground"
      >
        {t("versionPickerLabel")}
      </Label>
      <Select
        value={currentPublicId}
        onValueChange={handleChange}
        disabled={isPending}
      >
        <SelectTrigger id={SELECT_ID} size="sm" className="min-w-56">
          <SelectValue placeholder={t("versionPickerPlaceholder")} />
        </SelectTrigger>
        <SelectContent align="end">
          {versions.map((v) => (
            <SelectItem key={v.public_id} value={v.public_id}>
              {v.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
