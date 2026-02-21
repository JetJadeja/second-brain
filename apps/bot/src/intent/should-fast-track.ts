import type { BotContext } from '../context.js'

const URL_REGEX = /https?:\/\/[^\s]+/g
const SHORT_CONTEXT_LIMIT = 20

/**
 * Determines if a message should skip LLM intent detection
 * and go directly to the save-content pipeline.
 *
 * Fast-tracked: attachments, bare URLs, URLs with minimal text.
 */
export function shouldFastTrack(ctx: BotContext): boolean {
  const msg = ctx.message
  if (!msg) return false

  if (hasAttachment(ctx)) return true

  const text = msg.text ?? msg.caption ?? ''
  if (!text.trim()) return false

  return isUrlWithMinimalText(text)
}

function hasAttachment(ctx: BotContext): boolean {
  const msg = ctx.message
  if (!msg) return false

  return !!(msg.photo?.length || msg.voice || msg.document || msg.video)
}

function isUrlWithMinimalText(text: string): boolean {
  const urls = text.match(URL_REGEX)
  if (!urls || urls.length === 0) return false

  const textWithoutUrls = text.replace(URL_REGEX, '').trim()
  return textWithoutUrls.length <= SHORT_CONTEXT_LIMIT
}
