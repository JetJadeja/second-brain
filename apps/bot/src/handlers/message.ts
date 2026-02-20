import { getAllBuckets } from '@second-brain/db'
import { buildParaTree } from '@second-brain/shared'
import type { BotContext } from '../context.js'
import { detectMessageType } from './detect-message-type.js'
import { extractArticle } from '../extractors/extract-article.js'
import { extractThought } from '../extractors/extract-thought.js'
import { extractTweet } from '../extractors/extract-tweet.js'
import { processNote } from '../processors/process-note.js'
import { formatReceipt } from '../formatters/format-receipt.js'
import { getBucketPath } from './resolve-bucket-path.js'
import { storeReceipt } from './receipt-store.js'

export async function handleMessage(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const text = ctx.message?.text ?? ctx.message?.caption ?? ''
  if (!text.trim() && !ctx.message?.document && !ctx.message?.photo && !ctx.message?.voice) {
    return
  }

  // Let the user know we're working on it
  await ctx.replyWithChatAction('typing')

  const detected = detectMessageType(ctx)

  // Extract content based on type
  let extractionWarning: string | undefined
  let extracted

  if (detected.sourceType === 'article' && detected.url) {
    const result = await extractArticle(detected.url)
    extracted = result.content
    extractionWarning = result.warning
  } else if ((detected.sourceType === 'tweet' || detected.sourceType === 'thread') && detected.url) {
    const result = await extractTweet(detected.url)
    extracted = result.content
    extractionWarning = result.warning
  } else if (detected.sourceType === 'thought') {
    extracted = extractThought(text)
  } else {
    // Phase E content types — save URL/text as-is for now
    extracted = extractThought(detected.url ?? text)
    extracted.sourceType = detected.sourceType
    if (detected.url) {
      extracted.source = { url: detected.url } as unknown as typeof extracted.source
    }
  }

  // Run AI pipeline
  const result = await processNote(userId, extracted, detected.userNote, extractionWarning)

  // Resolve bucket path for receipt
  const bucketPath = await getBucketPath(userId, result.note.ai_suggested_bucket)

  // Send receipt and store for interaction tracking
  const receipt = formatReceipt(result, bucketPath)
  const sent = await ctx.reply(receipt)

  if (ctx.chat?.id) {
    storeReceipt(ctx.chat.id, sent.message_id, result.note.id)
  }
}
