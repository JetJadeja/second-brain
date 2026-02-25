import type { ExtractedContent } from '@second-brain/shared'
import { extractUrlsFromText, stripUrlsFromText } from '@second-brain/shared'
import { processNote } from '../processors/process-note.js'
import { getAllBuckets, getBucketPath } from '../para/para-cache.js'
import { updateNote } from '@second-brain/db'
import { runExtractionAgent } from '../extractors/run-extraction-agent.js'
import { extractThought } from '../extractors/extract-thought.js'
import { fallbackExtract } from '../extractors/fallback-extract.js'

export interface SaveNoteResult {
  noteId: string
  title: string
  summary: string | null
  suggestedBucket: string | null
  createdBucketName: string | null
  deduplicated: boolean
  warning?: string
}

export interface SaveNoteInput {
  userId: string
  content: string
  sourceType?: string
  suggested_bucket?: string
  preExtracted?: ExtractedContent
  userNote?: string | null
}

export async function executeSaveNote(input: SaveNoteInput): Promise<SaveNoteResult> {
  const { userId, content, preExtracted, userNote } = input

  let extracted: ExtractedContent
  let resolvedUserNote = userNote ?? null
  let agentSummary: string | null = null

  if (preExtracted) {
    extracted = preExtracted
  } else {
    const result = await extractContent(content)
    extracted = result.extracted
    resolvedUserNote = resolvedUserNote ?? result.userNote
    agentSummary = result.summary
  }

  const result = await processNote(userId, extracted, resolvedUserNote, {
    summary: agentSummary,
  })

  const suggestedBucket = await resolveAgentSuggestion(userId, result.note.id, input.suggested_bucket)
    ?? await getBucketPath(userId, result.note.ai_suggested_bucket)

  return {
    noteId: result.note.id,
    title: result.note.title,
    summary: result.summary,
    suggestedBucket,
    createdBucketName: result.createdBucketName,
    deduplicated: result.deduplicated,
    warning: result.warning,
  }
}

interface ExtractionResult {
  extracted: ExtractedContent
  userNote: string | null
  summary: string | null
}

async function extractContent(content: string): Promise<ExtractionResult> {
  const urls = extractUrlsFromText(content)

  if (urls.length === 0) {
    return { extracted: extractThought(content), userNote: null, summary: null }
  }

  const url = urls[0]!
  const userNote = stripUrlsFromText(content) || null

  try {
    const agentResult = await runExtractionAgent(url)
    return { extracted: agentResult.extracted, userNote, summary: agentResult.summary }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[extractContent] Agent failed, using fallback:', msg)

    const extracted = await fallbackExtract(url)
    return { extracted: extracted ?? extractThought(content), userNote, summary: null }
  }
}

async function resolveAgentSuggestion(
  userId: string,
  noteId: string,
  suggestedName: string | undefined,
): Promise<string | null> {
  if (!suggestedName) return null

  const buckets = await getAllBuckets(userId)
  const match = buckets.find(b => b.name.toLowerCase() === suggestedName.toLowerCase())
  if (!match) return null

  await updateNote(userId, noteId, { ai_suggested_bucket: match.id })
  return getBucketPath(userId, match.id)
}
