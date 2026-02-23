import type { ExtractedContent, ReelSource } from '@second-brain/shared'
import type { ExtractionResult } from './extract-article.js'
import { fetchYtDlpMetadata } from './run-ytdlp.js'
import { describeThumbnail } from './describe-thumbnail.js'

export async function extractReel(url: string): Promise<ExtractionResult> {
  const fallback = buildFallback(url)

  const meta = await fetchYtDlpMetadata(url)

  if (!meta) {
    return { content: fallback, warning: "Couldn't extract reel content. Saved the link." }
  }

  const title = meta.title || meta.description?.slice(0, 80) || 'Instagram Reel'
  const caption = meta.description || ''

  // Analyze thumbnail for visual content description
  const thumbnailDescription = meta.thumbnail
    ? await describeThumbnail(meta.thumbnail)
    : null

  const content = buildContent(caption, thumbnailDescription)

  const source: ReelSource = {
    url,
    domain: 'instagram.com',
    thumbnail_url: meta.thumbnail,
    media_description: thumbnailDescription ?? undefined,
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

function buildContent(caption: string, thumbnailDescription: string | null): string {
  const parts: string[] = []
  if (caption) parts.push(caption)
  if (thumbnailDescription) parts.push(`Visual content: ${thumbnailDescription}`)
  return parts.join('\n\n')
}

function buildFallback(url: string): ExtractedContent {
  return {
    title: 'Instagram Reel',
    content: '',
    sourceType: 'reel',
    source: { url, domain: 'instagram.com' } as ReelSource,
  }
}
