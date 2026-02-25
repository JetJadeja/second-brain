import { extractUrlsFromText } from '@second-brain/shared'
import type { BotContext } from '../context.js'

const ACK_MESSAGES = ['on it', 'got it', 'looking into this', 'one sec']

export function needsAsyncProcessing(ctx: BotContext): boolean {
  const msg = ctx.message
  if (!msg) return false

  if (msg.photo?.length) return true
  if (msg.voice) return true
  if (msg.document) return true
  if (msg.video) return true

  const text = msg.text ?? msg.caption ?? ''
  if (extractUrlsFromText(text).length > 0) return true

  return false
}

export function getAckMessage(): string {
  const index = Math.floor(Math.random() * ACK_MESSAGES.length)
  return ACK_MESSAGES[index]!
}
