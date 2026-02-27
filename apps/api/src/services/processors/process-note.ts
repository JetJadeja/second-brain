import { generateEmbedding } from '@second-brain/ai'
import type { Note, ExtractedContent, ClassifyResult } from '@second-brain/shared'
import { summarizeContent } from './summarize-content.js'
import { classifyContent } from './classify-content.js'
import { detectConnections } from './detect-connections.js'
import { saveNote } from './save-note.js'
import { maybeTriggerReorganization } from '../reorganization/trigger-reorganization.js'
import { maybeTriggerOverview } from '../overview/trigger-overview.js'

export interface ProcessedNote {
  note: Note
  summary: string | null
  classification: ClassifyResult | null
  createdBucketName: string | null
  deduplicated: boolean
  warning?: string
}

export interface ProcessNoteOptions {
  summary?: string | null
  warning?: string
}

export async function processNote(
  userId: string,
  extracted: ExtractedContent,
  userNote: string | null,
  options?: ProcessNoteOptions,
): Promise<ProcessedNote> {
  const embeddingText = [extracted.title, extracted.content, userNote]
    .filter(Boolean)
    .join('\n\n')

  const { summary, embedding, classification } = options?.summary
    ? await withPrecomputedSummary(userId, extracted, userNote, embeddingText, options.summary)
    : await withFreshSummary(userId, extracted, userNote, embeddingText)

  // Step 4: Save note (may create a bucket from classification suggestion)
  const { note, createdBucketName, deduplicated } = await saveNote({
    userId,
    extracted,
    userNote,
    summary,
    embedding,
    classification,
  })

  // Step 5-6: Skip fire-and-forget steps for deduplicated notes
  if (!deduplicated) {
    if (embedding) {
      detectConnections(userId, note.id, embedding).catch((err) =>
        console.error('[process-note] connection detection failed:', err),
      )
    }
    maybeTriggerReorganization(userId)
    if (note.bucket_id) void maybeTriggerOverview(userId, note.bucket_id)
  }

  return { note, summary, classification, createdBucketName, deduplicated, warning: options?.warning }
}

interface PipelineResult {
  summary: string | null
  embedding: number[] | null
  classification: ClassifyResult | null
}

/** Agent provided a summary — run embedding + classify in parallel, classify gets the real summary. */
async function withPrecomputedSummary(
  userId: string,
  extracted: ExtractedContent,
  userNote: string | null,
  embeddingText: string,
  summary: string,
): Promise<PipelineResult> {
  const [embedding, classification] = await Promise.all([
    generateEmbedding(embeddingText),
    classifyContent({
      userId,
      title: extracted.title,
      content: extracted.content,
      summary,
      sourceType: extracted.sourceType,
      userNote,
    }),
  ])
  return { summary, embedding, classification }
}

/** No pre-computed summary — generate one first, then classify with it. */
async function withFreshSummary(
  userId: string,
  extracted: ExtractedContent,
  userNote: string | null,
  embeddingText: string,
): Promise<PipelineResult> {
  const [embedding, summarizeResult] = await Promise.all([
    generateEmbedding(embeddingText),
    summarizeContent({
      title: extracted.title,
      content: extracted.content,
      sourceType: extracted.sourceType,
      userNote,
    }),
  ])

  const summary = summarizeResult?.summary ?? null

  const classification = await classifyContent({
    userId,
    title: extracted.title,
    content: extracted.content,
    summary,
    sourceType: extracted.sourceType,
    userNote,
  })

  return { summary, embedding, classification }
}
