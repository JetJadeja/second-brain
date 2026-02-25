import type { ExtractedContent } from '@second-brain/shared'
import { classifyUrl } from './classify-url.js'
import { extractArticle } from './extract-article.js'
import { extractTweet } from './extract-tweet.js'
import { extractReel } from './extract-reel.js'
import { extractYoutube } from './extract-youtube.js'

/**
 * Fallback extraction using the old classify → dispatch pattern.
 * Used when the extraction agent fails.
 */
export async function fallbackExtract(url: string): Promise<ExtractedContent | null> {
  const sourceType = classifyUrl(url)

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
    console.error('[fallbackExtract] Failed:', msg)
    return null
  }
}
