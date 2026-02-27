import type { BotContext } from '../context.js'
import type { ChatResponse } from '@second-brain/shared'
import { sendChatMessage } from '../api-client.js'
import { buildChatRequest } from '../telegram/build-chat-request.js'
import { detectMessageType, type DetectedMessage } from '../telegram/detect-message-type.js'
import { formatMultiLinkResults } from '../telegram/format-multi-link-result.js'
import { classifyError, formatUserError } from './format-error.js'
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

  await withUserLock(userId, () => handleMessage(ctx, chatId, userId))
}

async function handleMessage(ctx: BotContext, chatId: number, userId: string): Promise<void> {
  const detected = detectMessageType(ctx)

  if (Array.isArray(detected)) {
    await handleMultiLink(ctx, chatId, userId, detected)
    return
  }

  if (needsAsyncProcessing(ctx)) {
    await ctx.reply(getAckMessage())
    processInBackground({ ctx, chatId, sourceType: detected.sourceType })
    return
  }

  await ctx.replyWithChatAction('typing')

  try {
    const request = await buildChatRequest(ctx)
    const response = await sendChatMessage(request)

    const sentMessage = await ctx.reply(response.text)

    if (response.noteIds.length > 0) {
      storeReceipt(chatId, sentMessage.message_id, response.noteIds[0]!)
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[agent-handler] sync path failed:', msg)
    const stage = classifyError(error)
    await ctx.reply(formatUserError(detected.sourceType, stage))
  }
}

export interface MultiLinkResult {
  url: string
  response?: ChatResponse
  error?: string
}

const MAX_CONCURRENCY = 3

function processOneLink(userId: string, msg: DetectedMessage): Promise<MultiLinkResult> {
  const url = msg.url ?? ''
  return sendChatMessage({ userId, message: url, platform: 'Telegram' })
    .then((response): MultiLinkResult => ({ url, response }))
    .catch((error: unknown): MultiLinkResult => {
      const errMsg = error instanceof Error ? error.message : String(error)
      console.error(`[multi-link] Failed to process ${url}:`, errMsg)
      const stage = classifyError(error)
      return { url, error: formatUserError('article', stage) }
    })
}

async function handleMultiLink(
  ctx: BotContext,
  chatId: number,
  userId: string,
  messages: DetectedMessage[],
): Promise<void> {
  await ctx.reply(`on it — processing ${messages.length} links`)

  const results: MultiLinkResult[] = []

  for (let i = 0; i < messages.length; i += MAX_CONCURRENCY) {
    await ctx.replyWithChatAction('typing')
    const batch = messages.slice(i, i + MAX_CONCURRENCY)
    const batchResults = await Promise.all(batch.map((msg) => processOneLink(userId, msg)))
    results.push(...batchResults)
  }

  const confirmation = formatMultiLinkResults(results)
  await ctx.api.sendMessage(chatId, confirmation)
}
