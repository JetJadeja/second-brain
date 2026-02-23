import { callClaudeVision } from '@second-brain/ai'

const THUMBNAIL_PROMPT =
  'Describe what this video thumbnail shows in 1-2 sentences. ' +
  'Focus on the subject, activity, and any visible text overlays.'

/**
 * Fetches a thumbnail image and describes it using Claude Vision.
 * Returns null on any failure — never throws.
 */
export async function describeThumbnail(thumbnailUrl: string): Promise<string | null> {
  try {
    const buffer = await fetchImage(thumbnailUrl)
    if (!buffer) return null

    const base64 = buffer.toString('base64')
    const description = await callClaudeVision({
      imageData: base64,
      mediaType: 'image/jpeg',
      prompt: THUMBNAIL_PROMPT,
      maxTokens: 256,
    })

    return description.trim() || null
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[describeThumbnail] Failed:', msg)
    return null
  }
}

async function fetchImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}
