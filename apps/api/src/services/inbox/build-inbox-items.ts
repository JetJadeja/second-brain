import type { Note, InboxItem } from '@second-brain/shared'
import { SIMILARITY_THRESHOLD_RELATED } from '@second-brain/shared'
import { findSimilarNotes } from '@second-brain/db'
import { getBucketPath } from '../para/para-cache.js'

export async function buildInboxItems(
  userId: string,
  notes: Note[],
): Promise<InboxItem[]> {
  return Promise.all(notes.map((n) => buildItem(userId, n)))
}

async function buildItem(userId: string, n: Note): Promise<InboxItem> {
  const relatedNotes = await findRelated(userId, n)

  return {
    id: n.id,
    title: n.title,
    original_content: n.original_content,
    ai_summary: n.ai_summary,
    source_type: n.source_type,
    source: n.source,
    ai_suggested_bucket: n.ai_suggested_bucket,
    ai_suggested_bucket_path: await getBucketPath(userId, n.ai_suggested_bucket),
    tags: n.tags,
    user_note: n.user_note,
    captured_at: n.captured_at,
    related_notes: relatedNotes,
  }
}

async function findRelated(
  userId: string,
  note: Note,
): Promise<InboxItem['related_notes']> {
  if (!note.embedding) return []

  try {
    const emb = parseEmbedding(note.embedding)
    if (emb.length === 0) return []
    return findSimilarNotes(userId, emb, note.id, 3, SIMILARITY_THRESHOLD_RELATED)
  } catch {
    return []
  }
}

function parseEmbedding(raw: unknown): number[] {
  if (typeof raw === 'string') return JSON.parse(raw) as number[]
  if (Array.isArray(raw)) return raw as number[]
  return []
}
