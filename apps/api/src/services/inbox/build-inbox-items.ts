import type { Note, InboxItem } from '@second-brain/shared'
import { getBucketPath } from '../para/para-cache.js'

export async function buildInboxItems(
  userId: string,
  notes: Note[],
): Promise<InboxItem[]> {
  return Promise.all(notes.map((n) => buildItem(userId, n)))
}

async function buildItem(userId: string, n: Note): Promise<InboxItem> {
  return {
    id: n.id,
    title: n.title,
    original_content: n.original_content,
    ai_summary: n.ai_summary,
    source_type: n.source_type,
    source: n.source,
    ai_suggested_bucket: n.ai_suggested_bucket,
    ai_suggested_bucket_path: await getBucketPath(userId, n.ai_suggested_bucket),
    ai_confidence: n.ai_confidence,
    user_note: n.user_note,
    captured_at: n.captured_at,
    related_notes: [],
  }
}
