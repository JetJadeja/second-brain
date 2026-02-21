export interface SuggestNewBucket {
  name: string
  parent_type: 'project' | 'area' | 'resource'
}

export interface ClassifyResult {
  bucket_id: string
  confidence: number
  tags: string[]
  is_original_thought: boolean
  suggest_new_bucket?: SuggestNewBucket
}
