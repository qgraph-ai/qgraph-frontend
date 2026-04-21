import { BookOpen, Layers, Search, type LucideIcon } from "lucide-react"

export type AppKey = "quran" | "segmentation" | "search"

export type AppCard = {
  key: AppKey
  href: string
  Icon: LucideIcon
  titleKey: `${AppKey}Title`
  bodyKey: `${AppKey}Body`
}

export const APPS: AppCard[] = [
  { key: "quran", href: "/quran", Icon: BookOpen, titleKey: "quranTitle", bodyKey: "quranBody" },
  {
    key: "segmentation",
    href: "/segmentation",
    Icon: Layers,
    titleKey: "segmentationTitle",
    bodyKey: "segmentationBody",
  },
  { key: "search", href: "/search", Icon: Search, titleKey: "searchTitle", bodyKey: "searchBody" },
]
