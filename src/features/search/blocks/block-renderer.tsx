"use client"

import type { SearchResponseBlock } from "@/services/search"

import { BLOCK_REGISTRY } from "./block-registry"
import { UnknownBlock } from "./unknown-block"

export function BlockRenderer({ block }: { block: SearchResponseBlock }) {
  const Renderer = BLOCK_REGISTRY[block.block_type] ?? UnknownBlock
  return <Renderer block={block} />
}
