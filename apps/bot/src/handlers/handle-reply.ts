import { getNoteById } from '@second-brain/db'
import type { BotContext } from '../context.js'
import { getReceiptNoteId, storeReceipt } from './receipt-store.js'
import { sendChatMessage } from '../api-client.js'
import { buildChatRequest } from '../telegram/build-chat-request.js'
import { needsAsyncProcessing, getAckMessage } from './needs-async.js'
import { processInBackground } from './process-in-background.js'

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

  const noteContext = buildNoteContext(note, noteId)

  if (needsAsyncProcessing(ctx)) {
    await ctx.reply(getAckMessage())
    processInBackground({ ctx, chatId, buildRequestOptions: { noteContext } })
    return
  }

  await ctx.replyWithChatAction('typing')

  const request = await buildChatRequest(ctx, { noteContext })
  const response = await sendChatMessage(request)

  const sentMessage = await ctx.reply(response.text)

  if (response.noteIds.length > 0) {
    storeReceipt(chatId, sentMessage.message_id, response.noteIds[0]!)
  }
}

function buildNoteContext(
  note: { title: string; original_content: string | null; source_type: string },
  noteId: string,
): string {
  return (
    `The user is replying to a receipt for note "${note.title}" (ID: ${noteId}, type: ${note.source_type}). ` +
    `Their reply is about this note. They might want to move it, reclassify it, or ask about it.`
  )
}
