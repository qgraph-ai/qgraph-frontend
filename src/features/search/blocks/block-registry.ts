import type { ComponentType } from "react"

import type { BlockProps } from "./block-types"
import { MarkdownBlock } from "./markdown-block"
import { SurahDistributionBlock } from "./surah-distribution-block"
import { TextBlock } from "./text-block"

export const BLOCK_REGISTRY: Record<string, ComponentType<BlockProps>> = {
  text: TextBlock,
  markdown: MarkdownBlock,
  surah_distribution: SurahDistributionBlock,
}
