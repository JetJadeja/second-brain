import { createNote } from '@second-brain/db'
import type { Note, ExtractedContent, ClassifyResult } from '@second-brain/shared'
import { createSuggestedBucket } from './create-suggested-bucket.js'

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
}

export async function saveNote(params: SaveNoteParams): Promise<SaveNoteResult> {
  const { userId, extracted, title, userNote, summary, embedding, classification } = params

  const createdBucketName = await handleBucketCreation(userId, classification)
  const bucketFields = resolveBucketFields(classification)
  const isThought = extracted.sourceType === 'thought' || extracted.sourceType === 'voice_memo'

  const note = await createNote({
    user_id: userId,
    title: title ?? extracted.title,
    original_content: extracted.content || null,
    ai_summary: summary,
    source_type: extracted.sourceType,
    source: extracted.source as Record<string, unknown>,
    user_note: userNote,
    embedding,
    tags: classification?.tags ?? [],
    is_original_thought: isThought || (classification?.is_original_thought ?? false),
    ...bucketFields,
  })

  return { note, createdBucketName }
}

async function handleBucketCreation(
  userId: string,
  classification: ClassifyResult | null,
): Promise<string | null> {
  if (!classification?.suggest_new_bucket) return null
  if (classification.confidence < 0.4) return null

  const bucketId = await createSuggestedBucket(userId, classification.suggest_new_bucket)
  if (!bucketId) return null

  // Replace the suggestion with the real bucket ID
  const name = classification.suggest_new_bucket.name
  classification.bucket_id = bucketId
  classification.suggest_new_bucket = undefined

  return name
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

  // High confidence — set bucket and suggest
  return {
    bucket_id: bucket_id,
    ai_suggested_bucket: bucket_id,
    ai_confidence: confidence,
    is_classified: false, // user still confirms
  }
}
