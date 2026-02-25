import type { NoteSource } from '@second-brain/shared'

export function classifyUrl(url: string): NoteSource {
  let hostname: string
  try {
    hostname = new URL(url).hostname.replace('www.', '')
  } catch {
    return 'article'
  }

  if (hostname === 'twitter.com' || hostname === 'x.com') {
    return 'tweet'
  }

  if (hostname === 'instagram.com') {
    return 'reel'
  }

  if (hostname === 'youtube.com' || hostname === 'youtu.be') {
    return 'youtube'
  }

  return 'article'
}
