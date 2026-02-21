import type { BotContext } from '../../context.js'
import { detectMessageType } from '../../handlers/detect-message-type.js'
import { extractByType } from './extract-content.js'
import { processNote } from '../../processors/process-note.js'
import { formatReceipt } from '../../formatters/format-receipt.js'
import { getBucketPath } from '../../handlers/resolve-bucket-path.js'
import { storeReceipt } from '../../handlers/receipt-store.js'
import { recordBotResponse } from '../../conversation/record-exchange.js'

export async function handleSaveContent(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const text = ctx.message?.text ?? ctx.message?.caption ?? ''
  if (!text.trim() && !ctx.message?.document && !ctx.message?.photo && !ctx.message?.voice) {
    return
  }

  await ctx.replyWithChatAction('typing')

  const detected = detectMessageType(ctx)
  const { content: extracted, warning } = await extractByType(ctx, userId, detected)

  const result = await processNote(userId, extracted, detected.userNote, warning)

  const bucketPath = await getBucketPath(userId, result.note.ai_suggested_bucket)
  const receipt = formatReceipt(result, bucketPath)
  const sent = await ctx.reply(receipt)

  if (ctx.chat?.id) {
    storeReceipt(ctx.chat.id, sent.message_id, result.note.id)
  }

  const summary = `Saved '${result.note.title}' to Inbox, suggested: ${bucketPath ?? 'none'}`
  recordBotResponse(userId, summary, [result.note.id])
}
