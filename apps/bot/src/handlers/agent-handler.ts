import type { BotContext } from '../context.js'
import { sendChatMessage } from '../api-client.js'
import { buildChatRequest } from '../telegram/build-chat-request.js'
import { storeReceipt } from './receipt-store.js'
import { needsAsyncProcessing, getAckMessage } from './needs-async.js'
import { processInBackground } from './process-in-background.js'
import { hasProcessed, markProcessed } from './update-tracker.js'
import { withUserLock } from './user-lock.js'

export async function runAgentHandler(ctx: BotContext): Promise<void> {
  if (hasProcessed(ctx.update.update_id)) return
  markProcessed(ctx.update.update_id)

  const userId = ctx.userId
  if (!userId) return

  const chatId = ctx.chat?.id
  if (!chatId) return

  await withUserLock(userId, () => handleMessage(ctx, chatId))
}

async function handleMessage(ctx: BotContext, chatId: number): Promise<void> {
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
