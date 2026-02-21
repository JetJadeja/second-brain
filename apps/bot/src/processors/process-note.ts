import { generateEmbedding } from '@second-brain/ai'
import type { Note, ExtractedContent, ClassifyResult } from '@second-brain/shared'
import { summarizeContent } from './summarize-content.js'
import { classifyContent } from './classify-content.js'
import { detectConnections } from './detect-connections.js'
import { saveNote } from './save-note.js'

export interface ProcessedNote {
  note: Note
  summary: string | null
  classification: ClassifyResult | null
  createdBucketName: string | null
  warning?: string
}

export async function processNote(
  userId: string,
  extracted: ExtractedContent,
  userNote: string | null,
  warning?: string,
): Promise<ProcessedNote> {
  const embeddingText = [extracted.title, extracted.content, userNote]
    .filter(Boolean)
    .join('\n\n')

  // Steps 1, 2, 3 run in parallel
  const [embedding, summary, classification] = await Promise.all([
    generateEmbedding(embeddingText),
    summarizeContent({
      title: extracted.title,
      content: extracted.content,
      sourceType: extracted.sourceType,
      userNote,
    }),
    classifyContent({
      userId,
      title: extracted.title,
      content: extracted.content,
      summary: null, // summary isn't ready yet — classify uses raw content
      sourceType: extracted.sourceType,
      userNote,
    }),
  ])

  // Step 4: Save note (may create a bucket from classification suggestion)
  const { note, createdBucketName } = await saveNote({
    userId,
    extracted,
    userNote,
    summary,
    embedding,
    classification,
  })

  // Step 5: Detect connections (fire and forget)
  if (embedding) {
    detectConnections(userId, note.id, embedding).catch(() => {})
  }

  return { note, summary, classification, createdBucketName, warning }
}
