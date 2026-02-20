import { getServiceClient } from '../client.js'

export interface HybridSearchParams {
  userId: string
  queryText: string
  queryEmbedding: number[]
  matchCount?: number
  bucketId?: string | null
  sourceType?: string | null
  status?: string | null
  after?: string | null
  before?: string | null
}

export interface HybridSearchResult {
  id: string
  title: string
  original_content: string | null
  ai_summary: string | null
  distillation: string | null
  source_type: string
  source: Record<string, unknown>
  distillation_status: string
  bucket_id: string | null
  tags: string[]
  captured_at: string
  connection_count: number
  user_note: string | null
  is_original_thought: boolean
  similarity: number
  rank_score: number
}

export async function hybridSearch(
  params: HybridSearchParams,
): Promise<HybridSearchResult[]> {
  const { data, error } = await getServiceClient().rpc('hybrid_search', {
    p_user_id: params.userId,
    p_query_text: params.queryText,
    p_query_embedding: params.queryEmbedding,
    p_match_count: params.matchCount ?? 20,
    p_filter_bucket_id: params.bucketId ?? null,
    p_filter_source_type: params.sourceType ?? null,
    p_filter_status: params.status ?? null,
    p_filter_after: params.after ?? null,
    p_filter_before: params.before ?? null,
  })

  if (error) throw new Error(`hybridSearch: ${error.message}`)
  return (data ?? []) as HybridSearchResult[]
}

export async function insertSearchLog(
  userId: string,
  query: string,
  mode: 'notes' | 'answer',
  resultCount: number,
): Promise<void> {
  await getServiceClient()
    .from('search_log')
    .insert({
      user_id: userId,
      query,
      mode,
      result_count: resultCount,
    })
}
