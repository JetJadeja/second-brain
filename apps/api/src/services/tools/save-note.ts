import type { ExtractedContent } from '@second-brain/shared'
import { processNote } from '../processors/process-note.js'
import { getBucketPath } from '../processors/resolve-bucket-path.js'
import { classifyUrl } from '../extractors/classify-url.js'
import { extractArticle } from '../extractors/extract-article.js'
import { extractTweet } from '../extractors/extract-tweet.js'
import { extractReel } from '../extractors/extract-reel.js'
import { extractYoutube } from '../extractors/extract-youtube.js'
import { extractThought } from '../extractors/extract-thought.js'

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

  if (preExtracted) {
    extracted = preExtracted
  } else {
    const result = await extractContent(content)
    extracted = result.extracted
    resolvedUserNote = resolvedUserNote ?? result.userNote
  }

  const result = await processNote(userId, extracted, resolvedUserNote)
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
}

async function extractContent(content: string): Promise<ExtractionResult> {
  const urlMatch = content.match(URL_REGEX)

  if (!urlMatch) {
    return { extracted: extractThought(content), userNote: null }
  }

  const url = urlMatch[0]
  const userNote = content.replace(URL_REGEX, '').trim() || null
  const sourceType = classifyUrl(url)

  const extracted = await extractBySourceType(url, sourceType)
  return { extracted: extracted ?? extractThought(content), userNote }
}

async function extractBySourceType(
  url: string,
  sourceType: string,
): Promise<ExtractedContent | null> {
  try {
    switch (sourceType) {
      case 'tweet':
      case 'thread': {
        const result = await extractTweet(url)
        return result.content
      }
      case 'reel': {
        const result = await extractReel(url)
        return result.content
      }
      case 'youtube': {
        const result = await extractYoutube(url)
        return result.content
      }
      default: {
        const result = await extractArticle(url)
        return result.content
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[extractBySourceType] Failed:', msg)
    return null
  }
}
