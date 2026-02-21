import { getNoteById, updateNote } from '@second-brain/db'
import type { BotContext } from '../context.js'
import { getReceiptNoteId } from './receipt-store.js'
import { classifyContent } from '../processors/classify-content.js'
import { getBucketPath } from './resolve-bucket-path.js'
import { detectIntent } from '../intent/detect-intent.js'
import { handleMoveNote } from '../intent/handlers/handle-move-note.js'

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

  const replyText = ctx.message?.text
  if (!replyText) return

  await ctx.replyWithChatAction('typing')

  // Check if this is a move instruction
  const intent = await detectIntent({
    userId,
    messageText: replyText,
    hasAttachment: false,
    hasUrl: false,
  })

  if (intent.type === 'move_note') {
    await handleMoveNote(ctx, intent)
    return
  }

  // Otherwise, re-classify with the reply as additional context
  await reclassifyNote(ctx, userId, noteId, note, replyText)
}

async function reclassifyNote(
  ctx: BotContext,
  userId: string,
  noteId: string,
  note: { title: string; original_content: string | null; ai_summary: string | null; source_type: string },
  userContext: string,
): Promise<void> {
  const classification = await classifyContent({
    userId,
    title: note.title,
    content: note.original_content ?? '',
    summary: note.ai_summary,
    sourceType: note.source_type as import('@second-brain/shared').NoteSource,
    userNote: userContext,
  })

  if (!classification) {
    await ctx.reply("Couldn't re-classify with that context. Try being more specific.")
    return
  }

  await updateNote(userId, noteId, {
    ai_suggested_bucket: classification.bucket_id || null,
    ai_confidence: classification.confidence,
    tags: classification.tags,
    user_note: userContext,
  } as Record<string, unknown>)

  const bucketPath = await getBucketPath(userId, classification.bucket_id)
  const tags = classification.tags.map((t) => `#${t}`).join(' ')

  let reply = `Updated suggestion: ${bucketPath ?? 'Inbox'}`
  if (tags) reply += `\nTags: ${tags}`
  reply += '\n\nReact with 👍 to confirm.'

  await ctx.reply(reply)
}
