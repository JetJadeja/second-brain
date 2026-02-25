import type { YtDlpMetadata } from './run-ytdlp.js'

const MAX_TRANSCRIPT_LENGTH = 15_000

/**
 * Attempt to fetch transcript from yt-dlp subtitle data.
 * Falls back to null if no subtitles available.
 */
export async function fetchYoutubeTranscript(meta: YtDlpMetadata): Promise<string | null> {
  if (!meta.subtitles) return null

  // Prefer English auto-generated or manual subtitles
  const subtitleKey = meta.subtitles['en']
    ? 'en'
    : Object.keys(meta.subtitles).find((k) => k.startsWith('en'))

  if (!subtitleKey) return null

  const subs = meta.subtitles[subtitleKey]
  if (!subs || subs.length === 0) return null

  // Prefer json3 or vtt format
  const sub = subs.find((s) => s.ext === 'json3') ?? subs.find((s) => s.ext === 'vtt') ?? subs[0]
  if (!sub?.url) return null

  try {
    const res = await fetch(sub.url, { signal: AbortSignal.timeout(10_000) })
    const text = await res.text()

    // For json3 format, extract event text
    if (sub.ext === 'json3') {
      return parseJson3Transcript(text)
    }

    // For vtt/other, strip timing and return text
    return stripSubtitleTimings(text)
  } catch {
    return null
  }
}

function parseJson3Transcript(raw: string): string | null {
  try {
    const data = JSON.parse(raw) as { events?: Array<{ segs?: Array<{ utf8?: string }> }> }
    if (!data.events) return null

    const text = data.events
      .flatMap((e) => e.segs ?? [])
      .map((s) => s.utf8 ?? '')
      .join('')
      .trim()

    return text.slice(0, MAX_TRANSCRIPT_LENGTH) || null
  } catch {
    return null
  }
}

function stripSubtitleTimings(raw: string): string | null {
  const lines = raw
    .split('\n')
    .filter((line) => !line.match(/^\d{2}:\d{2}/) && !line.match(/^WEBVTT/) && line.trim())
    .join(' ')
    .trim()

  return lines.slice(0, MAX_TRANSCRIPT_LENGTH) || null
}
