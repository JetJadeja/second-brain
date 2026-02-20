import { getNoteById, updateNote } from '@second-brain/db'
import type { BotContext } from '../context.js'
import { getReceiptNoteId } from './receipt-store.js'
import { classifyContent } from '../processors/classify-content.js'
import { getBucketPath } from './resolve-bucket-path.js'

export async function handleReply(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const replyTo = ctx.message?.reply_to_message
  if (!replyTo) return

  const chatId = ctx.chat?.id
  if (!chatId) return

  const noteId = getReceiptNoteId(chatId, replyTo.message_id)
  if (!noteId) return

  const note = await getNoteById(userId, noteId)
  if (!note) return

  const newContext = ctx.message?.text
  if (!newContext) return

  await ctx.replyWithChatAction('typing')

  // Re-classify with additional user context
  const classification = await classifyContent({
    userId,
    title: note.title,
    content: note.original_content ?? '',
    summary: note.ai_summary,
    sourceType: note.source_type,
    userNote: newContext,
  })

  if (!classification) {
    await ctx.reply("Couldn't re-classify with that context. Try being more specific.")
    return
  }

  // Update note
  await updateNote(userId, noteId, {
    ai_suggested_bucket: classification.bucket_id || null,
    ai_confidence: classification.confidence,
    tags: classification.tags,
    user_note: newContext,
  } as Record<string, unknown>)

  const bucketPath = await getBucketPath(userId, classification.bucket_id)
  const tags = classification.tags.map((t) => `#${t}`).join(' ')

  let reply = `Updated suggestion: ${bucketPath ?? 'Inbox'}`
  if (tags) reply += `\nTags: ${tags}`
  reply += '\n\nReact with 👍 to confirm.'

  await ctx.reply(reply)
}
