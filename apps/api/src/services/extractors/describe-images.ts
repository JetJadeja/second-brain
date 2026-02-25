import { callClaudeVision } from '@second-brain/ai'

const MAX_IMAGES = 5

const IMAGE_PROMPT =
  'Describe what this image shows in 1-2 sentences. ' +
  'Focus on subjects, objects, text, and key visual details.'

/**
 * Describes multiple images using Claude Vision.
 * Returns an array of descriptions (one per URL, up to MAX_IMAGES).
 * Never throws — individual failures produce placeholder text.
 */
export async function describeImages(urls: string[]): Promise<string[]> {
  const capped = urls.slice(0, MAX_IMAGES)

  const results = await Promise.allSettled(
    capped.map((url) => describeOneImage(url)),
  )

  return results.map((r) =>
    r.status === 'fulfilled' && r.value
      ? r.value
      : '[Could not describe image]',
  )
}

async function describeOneImage(url: string): Promise<string | null> {
  const buffer = await fetchImage(url)
  if (!buffer) return null

  const base64 = buffer.toString('base64')
  const description = await callClaudeVision({
    imageData: base64,
    mediaType: 'image/jpeg',
    prompt: IMAGE_PROMPT,
    maxTokens: 256,
  })

  return description.trim() || null
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
