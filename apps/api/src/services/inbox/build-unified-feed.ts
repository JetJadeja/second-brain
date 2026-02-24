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
    getInboxNotes(userId, { page: 1, limit: 200 }),
    getPendingSuggestions(userId),
  ])

  const noteItems = await buildInboxItems(userId, notesResult.data)

  const unified: UnifiedInboxItem[] = [
    ...noteItems.map((data): UnifiedInboxItem => ({ kind: 'note', data })),
    ...suggestions.map((s): UnifiedInboxItem => ({
      kind: 'suggestion',
      data: toSuggestionItem(s),
    })),
  ]

  unified.sort((a, b) => {
    const dateA = a.kind === 'note' ? a.data.captured_at : a.data.created_at
    const dateB = b.kind === 'note' ? b.data.captured_at : b.data.created_at
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })

  const total = unified.length
  const offset = (page - 1) * limit
  const paginated = unified.slice(offset, offset + limit)

  return { items: paginated, total }
}

function toSuggestionItem(s: { id: string; type: string; payload: Record<string, unknown>; created_at: string }): SuggestionItem {
  return {
    id: s.id,
    type: s.type as SuggestionItem['type'],
    payload: s.payload,
    description: buildSuggestionDescription(s.type as SuggestionItem['type'], s.payload),
    created_at: s.created_at,
  }
}
