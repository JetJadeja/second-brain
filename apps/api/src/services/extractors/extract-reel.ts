import type { ExtractedContent, ReelSource } from '@second-brain/shared'
import type { ExtractionResult } from './extract-article.js'
import { fetchYtDlpMetadata, type YtDlpMetadata } from './run-ytdlp.js'
import { describeThumbnail } from './describe-thumbnail.js'
import { capTitle } from '@second-brain/shared'

export async function extractReel(url: string): Promise<ExtractionResult> {
  const fallback = buildFallback(url)

  const meta = await fetchYtDlpMetadata(url)

  if (!meta) {
    return { content: fallback, warning: "Couldn't extract reel content. Saved the link." }
  }

  const title = capTitle(meta.title || meta.description?.slice(0, 80) || 'Instagram Reel')
  const caption = meta.description || ''

  const thumbnailDescription = meta.thumbnail
    ? await describeThumbnail(meta.thumbnail)
    : null

  const content = buildContent(caption, thumbnailDescription)
  const mediaUrls = collectMediaUrls(meta)

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
      ...(mediaUrls.length > 0 ? { mediaUrls } : {}),
    },
  }
}

function buildContent(caption: string, thumbnailDescription: string | null): string {
  const parts: string[] = []
  if (caption) parts.push(caption)
  if (thumbnailDescription) parts.push(`Visual content: ${thumbnailDescription}`)
  return parts.join('\n\n')
}

/**
 * Collects distinct media image URLs from yt-dlp metadata.
 * Groups thumbnails by id and takes the highest-resolution variant per group.
 */
function collectMediaUrls(meta: YtDlpMetadata): string[] {
  if (!meta.thumbnails || meta.thumbnails.length <= 1) return []

  const byId = new Map<string, { url: string; size: number }>()
  for (const t of meta.thumbnails) {
    const id = t.id ?? t.url
    const size = (t.width ?? 0) * (t.height ?? 0)
    const existing = byId.get(id)
    if (!existing || size > existing.size) {
      byId.set(id, { url: t.url, size })
    }
  }

  if (byId.size <= 1) return []
  return [...byId.values()].map((v) => v.url)
}

function buildFallback(url: string): ExtractedContent {
  return {
    title: 'Instagram Reel',
    content: '',
    sourceType: 'reel',
    source: { url, domain: 'instagram.com' } as ReelSource,
  }
}
