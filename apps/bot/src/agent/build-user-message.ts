import type { BotContext } from '../context.js'

export function buildUserMessage(ctx: BotContext): string {
  const msg = ctx.message
  if (!msg) return '[empty message]'

  const text = msg.text ?? msg.caption ?? ''
  const parts: string[] = []

  if (msg.photo?.length) {
    parts.push('[User sent a photo]')
  }
  if (msg.voice) {
    parts.push('[User sent a voice memo]')
  }
  if (msg.document) {
    const name = msg.document.file_name ?? 'document'
    parts.push(`[User sent a file: ${name}]`)
  }
  if (msg.video) {
    parts.push('[User sent a video]')
  }

  if (text.trim()) {
    parts.push(text)
  }

  return parts.join('\n') || '[sent a message]'
}
