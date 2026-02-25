import { findSimilarNotes, createConnection } from '@second-brain/db'
import { SIMILARITY_THRESHOLD_CONNECTION } from '@second-brain/shared'

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
    const similar = await findSimilarNotes(
      userId, embedding, noteId, 5, SIMILARITY_THRESHOLD_CONNECTION,
    )

    for (const match of similar) {
      await createConnection(userId, noteId, match.id, 'ai_detected', match.similarity)
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[detectConnections] noteId=${noteId}:`, msg)
  }
}
