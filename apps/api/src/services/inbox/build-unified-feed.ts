import { getInboxNotes, getPendingSuggestions } from '@second-brain/db'
import type { UnifiedInboxItem, SuggestionItem } from '@second-brain/shared'
import { buildInboxItems } from './build-inbox-items.js'
import { buildSuggestionDescription } from './build-suggestion-description.js'

interface UnifiedFeedResult {
  items: UnifiedInboxItem[]
  total: number
}

export async function buildUnifiedFeed(
  userId: string,
  page: number,
  limit: number,
): Promise<UnifiedFeedResult> {
  const [notesResult, suggestions] = await Promise.all([
    getInboxNotes(userId, { page, limit }),
    getPendingSuggestions(userId),
  ])

  const noteItems = await buildInboxItems(userId, notesResult.data)

  const suggestionItems: UnifiedInboxItem[] = suggestions.map((s) => ({
    kind: 'suggestion',
    data: toSuggestionItem(s),
  }))

  const noteUnified: UnifiedInboxItem[] = noteItems.map((data) => ({
    kind: 'note',
    data,
  }))

  // Suggestions pin to top of page 1, notes are already DB-paginated
  const items = page === 1
    ? [...suggestionItems, ...noteUnified]
    : noteUnified

  const total = notesResult.total + suggestions.length

  return { items, total }
}

function toSuggestionItem(s: {
  id: string
  type: string
  payload: Record<string, unknown>
  created_at: string
}): SuggestionItem {
  return {
    id: s.id,
    type: s.type as SuggestionItem['type'],
    payload: s.payload,
    description: buildSuggestionDescription(s.type as SuggestionItem['type'], s.payload),
    created_at: s.created_at,
  }
}
