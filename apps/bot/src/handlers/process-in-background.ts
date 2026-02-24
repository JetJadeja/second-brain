import type { BotContext } from '../context.js'
import { buildChatRequest } from '../telegram/build-chat-request.js'
import { sendChatMessage } from '../api-client.js'
import { storeReceipt } from './receipt-store.js'

const TYPING_INTERVAL_MS = 4_000

interface BackgroundParams {
  ctx: BotContext
  chatId: number
  buildRequestOptions?: { noteContext?: string }
}

export function processInBackground(params: BackgroundParams): void {
  const { ctx, chatId, buildRequestOptions } = params

  const typingInterval = startTypingLoop(ctx, chatId)

  void (async () => {
    try {
      const request = await buildChatRequest(ctx, buildRequestOptions)
      const response = await sendChatMessage(request)

      clearInterval(typingInterval)

      const sentMessage = await ctx.api.sendMessage(chatId, response.text)

      if (response.noteIds.length > 0) {
        storeReceipt(chatId, sentMessage.message_id, response.noteIds[0]!)
      }
    } catch (error: unknown) {
      clearInterval(typingInterval)

      const msg = error instanceof Error ? error.message : String(error)
      console.error('[background] processing failed:', msg)

      try {
        await ctx.api.sendMessage(chatId, "couldn't process that one — try sending it again")
      } catch {
        console.error('[background] failed to send error message to chat')
      }
    }
  })()
}

function startTypingLoop(ctx: BotContext, chatId: number): ReturnType<typeof setInterval> {
  ctx.api.sendChatAction(chatId, 'typing').catch(() => {})

  return setInterval(() => {
    ctx.api.sendChatAction(chatId, 'typing').catch(() => {})
  }, TYPING_INTERVAL_MS)
}
