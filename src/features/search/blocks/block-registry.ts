import type { ComponentType } from "react"

import type { BlockProps } from "./block-types"
import { SurahDistributionBlock } from "./surah-distribution-block"
import { TextBlock } from "./text-block"

export const BLOCK_REGISTRY: Record<string, ComponentType<BlockProps>> = {
  text: TextBlock,
  surah_distribution: SurahDistributionBlock,
}
