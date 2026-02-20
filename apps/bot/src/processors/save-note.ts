import { createNote } from '@second-brain/db'
import type { Note, ExtractedContent, ClassifyResult } from '@second-brain/shared'

interface SaveNoteParams {
  userId: string
  extracted: ExtractedContent
  userNote: string | null
  summary: string | null
  embedding: number[] | null
  classification: ClassifyResult | null
}

export async function saveNote(params: SaveNoteParams): Promise<Note> {
  const { userId, extracted, userNote, summary, embedding, classification } = params

  const bucketFields = resolveBucketFields(classification)
  const isThought = extracted.sourceType === 'thought' || extracted.sourceType === 'voice_memo'

  return createNote({
    user_id: userId,
    title: extracted.title,
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
      ai_confidence: null,
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
