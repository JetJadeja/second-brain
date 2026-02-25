export type ErrorStage = 'download' | 'upload' | 'extraction' | 'api' | 'timeout' | 'unknown'

const LINK_SOURCES = new Set(['article', 'tweet', 'thread', 'reel', 'youtube'])

const CONTENT_NAMES: Record<string, string> = {
  article: 'link',
  tweet: 'tweet',
  thread: 'thread',
  reel: 'reel',
  image: 'photo',
  pdf: 'PDF',
  voice_memo: 'voice memo',
  youtube: 'video',
  video: 'video',
  document: 'document',
  thought: 'message',
}

export function classifyError(error: unknown): ErrorStage {
  if (error instanceof Error) {
    const name = error.name.toLowerCase()
    if (name === 'aborterror' || name === 'timeouterror') return 'timeout'
  }

  const msg = error instanceof Error ? error.message : String(error)
  const lower = msg.toLowerCase()

  if (lower.includes('timeout')) return 'timeout'
  if (lower.includes('download') || lower.includes('no file path')) return 'download'
  if (lower.includes('upload')) return 'upload'
  if (lower.includes('api returned') || lower.includes('econnrefused') || lower.includes('fetch failed')) return 'api'
  if (lower.includes('extract')) return 'extraction'

  return 'unknown'
}

export function formatUserError(sourceType: string, stage: ErrorStage): string {
  const name = CONTENT_NAMES[sourceType] ?? 'message'

  switch (stage) {
    case 'download':
      return `couldn't download your ${name} from Telegram — try sending it again`
    case 'upload':
      return `couldn't save your ${name} — try sending it again`
    case 'extraction':
      if (LINK_SOURCES.has(sourceType)) {
        return `couldn't read that ${name} — the page might be broken or behind a paywall`
      }
      return `couldn't process your ${name} — try sending it again`
    case 'api':
      return "the server is having trouble right now — try again in a moment"
    case 'timeout':
      return "that took too long to process — try sending it again"
    case 'unknown':
      return `something went wrong processing your ${name} — try sending it again`
  }
}
