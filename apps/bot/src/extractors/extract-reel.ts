import type { ExtractedContent, ReelSource } from '@second-brain/shared'
import type { ExtractionResult } from './extract-article.js'
import { fetchYtDlpMetadata } from './run-ytdlp.js'

export async function extractReel(url: string): Promise<ExtractionResult> {
  const fallback = buildFallback(url)

  const meta = await fetchYtDlpMetadata(url)

  if (!meta) {
    return { content: fallback, warning: "Couldn't extract reel content. Saved the link." }
  }

  const title = meta.title || meta.description?.slice(0, 80) || 'Instagram Reel'
  const content = meta.description || ''

  const source: ReelSource = {
    url,
    domain: 'instagram.com',
    thumbnail_url: meta.thumbnail,
  }

  return {
    content: {
      title,
      content,
      sourceType: 'reel',
      source,
      thumbnailUrl: meta.thumbnail,
    },
  }
}

function buildFallback(url: string): ExtractedContent {
  return {
    title: 'Instagram Reel',
    content: '',
    sourceType: 'reel',
    source: { url, domain: 'instagram.com' } as ReelSource,
  }
}
