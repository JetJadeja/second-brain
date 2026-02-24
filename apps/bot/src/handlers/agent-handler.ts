import type { BotContext } from '../context.js'
import { sendChatMessage } from '../api-client.js'
import { buildChatRequest } from '../telegram/build-chat-request.js'
import { storeReceipt } from './receipt-store.js'

export async function runAgentHandler(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  await ctx.replyWithChatAction('typing')

  const request = await buildChatRequest(ctx)
  const response = await sendChatMessage(request)

  const sentMessage = await ctx.reply(response.text)

  // Store receipts so replies can reference the note
  const chatId = ctx.chat?.id
  if (chatId && response.noteIds.length > 0) {
    storeReceipt(chatId, sentMessage.message_id, response.noteIds[0]!)
  }
}
