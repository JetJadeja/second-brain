import type { ClassifyResult } from '@second-brain/shared'

export interface BucketFields {
  bucket_id: string | null
  ai_suggested_bucket: string | null
  ai_confidence: number | null
  is_classified: boolean
}

// Notes always land in inbox (bucket_id = null, is_classified = false).
// Classifier provides a suggestion for the user to accept or reject.
export function resolveBucketFields(classification: ClassifyResult | null): BucketFields {
  const suggestion = classification?.bucket_id || null
  return {
    bucket_id: null,
    ai_suggested_bucket: suggestion,
    ai_confidence: classification?.confidence ?? null,
    is_classified: false,
  }
}
