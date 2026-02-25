import type { ClassifyResult } from '@second-brain/shared'

export interface BucketFields {
  bucket_id: string | null
  ai_suggested_bucket: string | null
  ai_confidence: number | null
  is_classified: boolean
}

// Agent owns ai_suggested_bucket via save_note's suggested_bucket param.
// Classifier still provides confidence metadata but no longer sets the suggestion.
export function resolveBucketFields(classification: ClassifyResult | null): BucketFields {
  return {
    bucket_id: null,
    ai_suggested_bucket: null,
    ai_confidence: classification?.confidence ?? null,
    is_classified: false,
  }
}
