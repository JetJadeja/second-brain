import type { BotContext } from '../context.js'
import { runAgent } from '../agent/run-agent.js'
import { storeReceipt } from './receipt-store.js'
import { recordUserMessage, recordBotResponse } from '../conversation/record-exchange.js'

export async function runAgentHandler(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const text = ctx.message?.text ?? ctx.message?.caption ?? ''
  if (text.trim()) {
    recordUserMessage(userId, text)
  }

  await ctx.replyWithChatAction('typing')

  const result = await runAgent(ctx)
  const sentMessage = await ctx.reply(result.text)

  // Store receipts so replies can reference the note
  const chatId = ctx.chat?.id
  if (chatId && result.noteIds.length > 0) {
    storeReceipt(chatId, sentMessage.message_id, result.noteIds[0]!)
  }

  recordBotResponse(userId, result.text, result.noteIds)
}
