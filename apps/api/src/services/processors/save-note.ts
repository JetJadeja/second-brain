import { createNote, createSuggestion, findExistingNoteByUrl, findExistingNoteByContentHash } from '@second-brain/db'
import { normalizeUrl, computeContentHash } from '@second-brain/shared'
import type { Note, ExtractedContent, ClassifyResult } from '@second-brain/shared'

interface SaveNoteParams {
  userId: string
  extracted: ExtractedContent
  title?: string
  userNote: string | null
  summary: string | null
  embedding: number[] | null
  classification: ClassifyResult | null
}

export interface SaveNoteResult {
  note: Note
  createdBucketName: string | null
  deduplicated: boolean
}

export async function saveNote(params: SaveNoteParams): Promise<SaveNoteResult> {
  const { userId, extracted, title, userNote, summary, embedding, classification } = params

  const sourceUrl = extractSourceUrl(extracted)
  const existingNote = await checkForDuplicate(userId, extracted, sourceUrl)
  if (existingNote) {
    return { note: existingNote, createdBucketName: null, deduplicated: true }
  }

  const bucketFields = resolveBucketFields(classification)
  const isThought = extracted.sourceType === 'thought' || extracted.sourceType === 'voice_memo'

  const { note, alreadyExisted } = await createNote({
    user_id: userId,
    title: title ?? extracted.title,
    original_content: extracted.content || null,
    ai_summary: summary,
    source_type: extracted.sourceType,
    source: extracted.source as Record<string, unknown>,
    source_url: sourceUrl,
    user_note: userNote,
    embedding,
    tags: classification?.tags ?? [],
    is_original_thought: isThought || (classification?.is_original_thought ?? false),
    ...bucketFields,
  })

  if (alreadyExisted) {
    return { note, createdBucketName: null, deduplicated: true }
  }

  await maybeCreateBucketSuggestion(userId, note, classification)

  return { note, createdBucketName: null, deduplicated: false }
}

async function maybeCreateBucketSuggestion(
  userId: string,
  note: Note,
  classification: ClassifyResult | null,
): Promise<void> {
  if (!classification?.suggest_new_bucket) return
  if (classification.confidence < 0.4) return

  const { name, parent_type } = classification.suggest_new_bucket
  try {
    await createSuggestion(userId, 'create_bucket', {
      note_id: note.id,
      note_title: note.title,
      bucket_name: name,
      parent_type,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[save-note] Failed to create bucket suggestion:', msg)
  }
}

function extractSourceUrl(extracted: ExtractedContent): string | null {
  const source = extracted.source as Record<string, unknown>
  if (typeof source.url === 'string' && source.url) {
    return normalizeUrl(source.url)
  }
  return null
}

const CONTENT_HASH_WINDOW_MINUTES = 5

async function checkForDuplicate(
  userId: string,
  extracted: ExtractedContent,
  sourceUrl: string | null,
): Promise<Note | null> {
  if (sourceUrl) {
    return findExistingNoteByUrl(userId, sourceUrl)
  }

  if (extracted.content) {
    const hash = computeContentHash(extracted.content)
    return findExistingNoteByContentHash(userId, hash, CONTENT_HASH_WINDOW_MINUTES)
  }

  return null
}

interface BucketFields {
  bucket_id: string | null
  ai_suggested_bucket: string | null
  ai_confidence: number | null
  is_classified: boolean
}

function resolveBucketFields(classification: ClassifyResult | null): BucketFields {
  if (!classification || !classification.bucket_id) {
    return {
      bucket_id: null,
      ai_suggested_bucket: null,
      ai_confidence: classification?.confidence ?? null,
      is_classified: false,
    }
  }

  const { bucket_id, confidence } = classification

  // Low confidence — don't suggest
  if (confidence < 0.4) {
    return {
      bucket_id: null,
      ai_suggested_bucket: null,
      ai_confidence: confidence,
      is_classified: false,
    }
  }

  // Medium confidence — suggest but don't auto-classify
  if (confidence < 0.85) {
    return {
      bucket_id: null,
      ai_suggested_bucket: bucket_id,
      ai_confidence: confidence,
      is_classified: false,
    }
  }

  // High confidence — suggest but never auto-assign. User always confirms via inbox.
  return {
    bucket_id: null,
    ai_suggested_bucket: bucket_id,
    ai_confidence: confidence,
    is_classified: false,
  }
}
