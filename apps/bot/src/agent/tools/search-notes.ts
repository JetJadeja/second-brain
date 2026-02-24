import { generateEmbedding } from '@second-brain/ai'
import { hybridSearch } from '@second-brain/db'
import { getBucketPath } from '../../handlers/resolve-bucket-path.js'

export interface SearchResult {
  title: string
  excerpt: string
  bucketPath: string | null
}

export interface SearchNotesResult {
  query: string
  results: SearchResult[]
}

export async function executeSearchNotes(
  userId: string,
  query: string,
): Promise<SearchNotesResult> {
  const embedding = await generateEmbedding(query)
  if (!embedding) {
    return { query, results: [] }
  }

  const results = await hybridSearch({
    userId,
    queryText: query,
    queryEmbedding: embedding,
    matchCount: 5,
  })

  const formatted: SearchResult[] = []
  for (const result of results) {
    const bucketPath = await getBucketPath(userId, result.bucket_id)
    formatted.push({
      title: result.title,
      excerpt: buildExcerpt(result.distillation ?? result.ai_summary ?? result.original_content),
      bucketPath,
    })
  }

  return { query, results: formatted }
}

function buildExcerpt(text: string | null | undefined): string {
  if (!text) return ''
  const clean = text.replace(/\n+/g, ' ').trim()
  return clean.length > 120 ? clean.slice(0, 117) + '...' : clean
}
