import { generateEmbedding } from '@second-brain/ai'
import type { Note, ExtractedContent, ClassifyResult } from '@second-brain/shared'
import { summarizeContent } from './summarize-content.js'
import { classifyContent } from './classify-content.js'
import { detectConnections } from './detect-connections.js'
import { saveNote } from './save-note.js'
import { maybeTriggerAnalysis } from '../maintenance/trigger-analysis.js'

export interface ProcessedNote {
  note: Note
  summary: string | null
  classification: ClassifyResult | null
  createdBucketName: string | null
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

  // Step 6: Maybe trigger maintenance analysis (fire and forget)
  maybeTriggerAnalysis(userId)

  return { note, summary, classification, createdBucketName, warning: options?.warning }
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
  const [embedding, summary] = await Promise.all([
    generateEmbedding(embeddingText),
    summarizeContent({
      title: extracted.title,
      content: extracted.content,
      sourceType: extracted.sourceType,
      userNote,
    }),
  ])

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
