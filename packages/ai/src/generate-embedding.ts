import { getOpenAIClient } from './providers/openai.js'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const MAX_CHARS = 30_000 // ~8k tokens rough estimate

/**
 * Generate a 1536-dimensional embedding vector for the given text.
 * Returns null on failure — the note gets saved without an embedding
 * and is still findable via full-text search.
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text || text.trim().length === 0) {
    return null
  }

  const input = text.length > MAX_CHARS
    ? text.slice(0, MAX_CHARS)
    : text

  try {
    const client = getOpenAIClient()
    const response = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input,
    })

    const embedding = response.data[0]?.embedding
    if (!embedding || embedding.length === 0) {
      console.error('[generateEmbedding] Empty embedding returned')
      return null
    }

    return embedding
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('[generateEmbedding] Failed:', message)
    return null
  }
}
