import type { ExtractedContent } from '@second-brain/shared'
import { processNote } from '../processors/process-note.js'
import { getBucketPath } from '../para/para-cache.js'
import { runExtractionAgent } from '../extractors/run-extraction-agent.js'
import { extractThought } from '../extractors/extract-thought.js'
import { fallbackExtract } from '../extractors/fallback-extract.js'

const URL_REGEX = /https?:\/\/[^\s]+/

export interface SaveNoteResult {
  noteId: string
  title: string
  summary: string | null
  suggestedBucket: string | null
  createdBucketName: string | null
  warning?: string
}

export interface SaveNoteInput {
  userId: string
  content: string
  sourceType?: string
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
  const suggestedBucket = await getBucketPath(userId, result.note.ai_suggested_bucket)

  return {
    noteId: result.note.id,
    title: result.note.title,
    summary: result.summary,
    suggestedBucket,
    createdBucketName: result.createdBucketName,
    warning: result.warning,
  }
}

interface ExtractionResult {
  extracted: ExtractedContent
  userNote: string | null
  summary: string | null
}

async function extractContent(content: string): Promise<ExtractionResult> {
  const urlMatch = content.match(URL_REGEX)

  if (!urlMatch) {
    return { extracted: extractThought(content), userNote: null, summary: null }
  }

  const url = urlMatch[0]!
  const userNote = content.replace(URL_REGEX, '').trim() || null

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
