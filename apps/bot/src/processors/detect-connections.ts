import { findSimilarNotes, createConnection } from '@second-brain/db'

const SIMILARITY_THRESHOLD = 0.78

/**
 * Find and create connections to similar notes.
 * Runs asynchronously — errors are logged, never thrown.
 */
export async function detectConnections(
  userId: string,
  noteId: string,
  embedding: number[],
): Promise<void> {
  try {
    const similar = await findSimilarNotes(userId, embedding, noteId, 5)

    for (const match of similar) {
      if (match.similarity >= SIMILARITY_THRESHOLD) {
        await createConnection(userId, noteId, match.id, 'ai_detected', match.similarity)
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[detectConnections] noteId=${noteId}:`, msg)
  }
}
