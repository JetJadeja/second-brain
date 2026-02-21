import type { BotContext } from '../context.js'
import { shouldFastTrack } from './should-fast-track.js'
import { detectIntent } from './detect-intent.js'
import { handleSaveContent } from './handlers/handle-save-content.js'
import { handleSearch } from './handlers/handle-search.js'
import { handleShowInbox } from './handlers/handle-show-inbox.js'
import { handleCreateBucket } from './handlers/handle-create-bucket.js'
import { handleMoveNote } from './handlers/handle-move-note.js'
import type { DetectedIntent } from '@second-brain/shared'

const URL_REGEX = /https?:\/\/[^\s]+/g

export async function routeByIntent(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const text = ctx.message?.text ?? ctx.message?.caption ?? ''
  const hasContent = text.trim() || ctx.message?.document || ctx.message?.photo || ctx.message?.voice
  if (!hasContent) return

  if (shouldFastTrack(ctx)) {
    await handleSaveContent(ctx)
    return
  }

  await ctx.replyWithChatAction('typing')

  const hasUrl = URL_REGEX.test(text)
  URL_REGEX.lastIndex = 0

  const intent = await detectIntent({
    userId,
    messageText: text,
    hasAttachment: false,
    hasUrl,
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
