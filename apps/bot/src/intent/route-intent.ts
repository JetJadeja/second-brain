import type { BotContext } from '../context.js'
import { shouldFastTrack } from './should-fast-track.js'
import { detectIntent } from './detect-intent.js'
import { handleSaveContent } from './handlers/handle-save-content.js'
import { handleSearch } from './handlers/handle-search.js'
import { handleShowInbox } from './handlers/handle-show-inbox.js'
import { handleCreateBucket } from './handlers/handle-create-bucket.js'
import { handleMoveNote } from './handlers/handle-move-note.js'
import { recordUserMessage } from '../conversation/record-exchange.js'
import { loadHistory } from '../conversation/load-history.js'
import type { DetectedIntent } from '@second-brain/shared'

const URL_REGEX = /https?:\/\/[^\s]+/g

export async function routeByIntent(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const text = ctx.message?.text ?? ctx.message?.caption ?? ''
  const hasContent = text.trim() || ctx.message?.document || ctx.message?.photo || ctx.message?.voice
  if (!hasContent) return

  // Record what the user sent
  recordUserMessage(userId, describeUserMessage(ctx, text))

  if (shouldFastTrack(ctx)) {
    await handleSaveContent(ctx)
    return
  }

  await ctx.replyWithChatAction('typing')

  const hasUrl = URL_REGEX.test(text)
  URL_REGEX.lastIndex = 0

  const conversationHistory = await loadHistory(userId)

  const intent = await detectIntent({
    userId,
    messageText: text,
    hasAttachment: false,
    hasUrl,
    conversationHistory,
  })

  await dispatchIntent(ctx, intent)
}

async function dispatchIntent(ctx: BotContext, intent: DetectedIntent): Promise<void> {
  switch (intent.type) {
    case 'search':
      await handleSearch(ctx, intent)
      return

    case 'create_bucket':
      await handleCreateBucket(ctx, intent)
      return

    case 'show_inbox':
      await handleShowInbox(ctx)
      return

    case 'move_note':
      if (ctx.message?.reply_to_message) {
        await handleMoveNote(ctx, intent)
      } else {
        await handleSaveContent(ctx)
      }
      return

    case 'save_content':
    case 'unknown':
    default:
      await handleSaveContent(ctx)
  }
}

function describeUserMessage(ctx: BotContext, text: string): string {
  if (text.trim()) return text
  const msg = ctx.message
  if (msg?.photo?.length) return '[sent a photo]'
  if (msg?.voice) return '[sent a voice memo]'
  if (msg?.document) return '[sent a document]'
  if (msg?.video) return '[sent a video]'
  return '[sent a message]'
}
