import type { BotContext } from '../context.js'
import { sendChatMessage } from '../api-client.js'
import { buildChatRequest } from '../telegram/build-chat-request.js'
import { storeReceipt } from './receipt-store.js'
import { needsAsyncProcessing, getAckMessage } from './needs-async.js'
import { processInBackground } from './process-in-background.js'

export async function runAgentHandler(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const chatId = ctx.chat?.id
  if (!chatId) return

  if (needsAsyncProcessing(ctx)) {
    await ctx.reply(getAckMessage())
    processInBackground({ ctx, chatId })
    return
  }

  await ctx.replyWithChatAction('typing')

  const request = await buildChatRequest(ctx)
  const response = await sendChatMessage(request)

  const sentMessage = await ctx.reply(response.text)

  if (response.noteIds.length > 0) {
    storeReceipt(chatId, sentMessage.message_id, response.noteIds[0]!)
  }
}
