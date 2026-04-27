"use client"

import { BookmarkButton } from "./bookmark-button"
import { FeedbackButtons } from "./feedback-buttons"

export function ResponseActions({ responseId }: { responseId: number }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
      <FeedbackButtons responseId={responseId} />
      <BookmarkButton responseId={responseId} />
    </div>
  )
}
