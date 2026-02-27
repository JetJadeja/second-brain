import type { ExtractedContent, YoutubeSource } from '@second-brain/shared'
import type { ExtractionResult } from './extract-article.js'
import { fetchYtDlpMetadata } from './run-ytdlp.js'
import { fetchYoutubeTranscript } from './fetch-youtube-transcript.js'
import { capTitle } from '@second-brain/shared'

export async function extractYoutube(url: string): Promise<ExtractionResult> {
  const fallback = buildFallback(url)

  const meta = await fetchYtDlpMetadata(url)

  if (!meta) {
    return { content: fallback, warning: "Couldn't extract YouTube metadata. Saved the link." }
  }

  const title = capTitle(meta.title || 'YouTube Video')
  const channel = meta.channel || meta.uploader

  // Try to get transcript for searchable content
  const transcript = await fetchYoutubeTranscript(meta)
  const content = transcript || meta.description || ''

  const source: YoutubeSource = {
    url,
    domain: 'youtube.com',
    thumbnail_url: meta.thumbnail,
    channel,
  }

  return {
    content: {
      title,
      content,
      sourceType: 'youtube',
      source,
      thumbnailUrl: meta.thumbnail,
    },
  }
}

function buildFallback(url: string): ExtractedContent {
  return {
    title: 'YouTube Video',
    content: '',
    sourceType: 'youtube',
    source: { url, domain: 'youtube.com' } as YoutubeSource,
  }
}
