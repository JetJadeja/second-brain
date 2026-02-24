import { getNoteById } from '@second-brain/db'
import type { BotContext } from '../context.js'
import { getReceiptNoteId } from './receipt-store.js'
import { runAgent } from '../agent/run-agent.js'
import { storeReceipt } from './receipt-store.js'
import { recordUserMessage, recordBotResponse } from '../conversation/record-exchange.js'

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
  recordUserMessage(userId, replyText)

  const noteContext = buildNoteContext(note, noteId)
  const result = await runAgent(ctx, noteContext)
  const sentMessage = await ctx.reply(result.text)

  if (result.noteIds.length > 0) {
    storeReceipt(chatId, sentMessage.message_id, result.noteIds[0]!)
  }

  recordBotResponse(userId, result.text, result.noteIds)
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
