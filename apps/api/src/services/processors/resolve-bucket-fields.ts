import type { ClassifyResult } from '@second-brain/shared'

export interface BucketFields {
  bucket_id: string | null
  ai_suggested_bucket: string | null
  ai_confidence: number | null
  is_classified: boolean
}

export function resolveBucketFields(classification: ClassifyResult | null): BucketFields {
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

  // Medium/high confidence — suggest but never auto-assign
  return {
    bucket_id: null,
    ai_suggested_bucket: bucket_id,
    ai_confidence: confidence,
    is_classified: false,
  }
}
