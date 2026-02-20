import { callClaudeVision } from '@second-brain/ai'
import type { ExtractedContent, ImageSource } from '@second-brain/shared'
import type { ExtractionResult } from './extract-article.js'

const DESCRIBE_PROMPT =
  'Describe this image in detail. What does it show? What text is visible? ' +
  'Be specific and factual. If it contains a screenshot, describe the content shown.'

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

export async function extractImage(
  buffer: Buffer,
  storagePath: string,
  mimeType: string | undefined,
): Promise<ExtractionResult> {
  const mediaType = resolveMediaType(mimeType)
  const fallback = buildFallback(storagePath)

  let description: string
  try {
    const base64 = buffer.toString('base64')
    description = await callClaudeVision({
      imageData: base64,
      mediaType,
      prompt: DESCRIBE_PROMPT,
    })
    description = description.trim()
  } catch (error) {
    console.error('Claude Vision description failed:', error)
    return {
      content: fallback,
      warning: "Couldn't describe this image. Saved the file.",
    }
  }

  if (!description) {
    return {
      content: fallback,
      warning: "Couldn't describe this image. Saved the file.",
    }
  }

  const firstSentence = description.split(/[.!?]/)[0] ?? description
  const title = firstSentence.length > 80 ? firstSentence.slice(0, 77) + '...' : firstSentence

  const source: ImageSource = {
    storage_path: storagePath,
    media_description: description,
  }

  return {
    content: {
      title,
      content: description,
      sourceType: 'image',
      source,
    },
  }
}

function resolveMediaType(mimeType: string | undefined): ImageMediaType {
  const supported: ImageMediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (mimeType && supported.includes(mimeType as ImageMediaType)) {
    return mimeType as ImageMediaType
  }
  return 'image/jpeg'
}

function buildFallback(storagePath: string): ExtractedContent {
  return {
    title: 'Image',
    content: '',
    sourceType: 'image',
    source: { storage_path: storagePath } as ImageSource,
  }
}
