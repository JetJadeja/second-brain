import type { BotContext } from '../context.js'

const URL_REGEX = /https?:\/\/[^\s]+/

const ACK_MESSAGES = ['on it', 'got it', 'looking into this', 'one sec']

export function needsAsyncProcessing(ctx: BotContext): boolean {
  const msg = ctx.message
  if (!msg) return false

  if (msg.photo?.length) return true
  if (msg.voice) return true
  if (msg.document) return true
  if (msg.video) return true

  const text = msg.text ?? msg.caption ?? ''
  if (URL_REGEX.test(text)) return true

  return false
}

export function getAckMessage(): string {
  const index = Math.floor(Math.random() * ACK_MESSAGES.length)
  return ACK_MESSAGES[index]!
}
