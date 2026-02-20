import { getNoteById, updateNote } from '@second-brain/db'
import type { BotContext } from '../context.js'
import { getReceiptNoteId } from './receipt-store.js'
import { getBucketPath } from './resolve-bucket-path.js'

export async function handleReaction(ctx: BotContext): Promise<void> {
  const update = ctx.messageReaction
  if (!update) return

  const userId = ctx.userId
  if (!userId) return

  // Check if reaction includes 👍
  const hasThumbsUp = update.new_reaction.some(
    (r) => r.type === 'emoji' && r.emoji === '👍',
  )
  if (!hasThumbsUp) return

  const chatId = update.chat.id
  const messageId = update.message_id
  const noteId = getReceiptNoteId(chatId, messageId)
  if (!noteId) return

  const note = await getNoteById(userId, noteId)
  if (!note) return

  // If no suggested bucket, thumbs-up is ignored
  if (!note.ai_suggested_bucket) {
    return
  }

  // Confirm placement
  await updateNote(userId, noteId, {
    bucket_id: note.ai_suggested_bucket,
    is_classified: true,
  } as Record<string, unknown>)

  const bucketPath = await getBucketPath(userId, note.ai_suggested_bucket)
  await ctx.api.sendMessage(chatId, `✅ Classified to ${bucketPath ?? 'suggested bucket'}`)
}
