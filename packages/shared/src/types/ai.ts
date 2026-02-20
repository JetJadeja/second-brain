export interface ClassifyResult {
  bucket_id: string
  confidence: number
  tags: string[]
  is_original_thought: boolean
}
