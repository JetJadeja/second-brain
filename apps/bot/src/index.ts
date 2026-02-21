import { Bot } from 'grammy'
import type { BotContext } from './context.js'
import { requireLinkedUser } from './middleware/auth.js'
import { handleStart } from './handlers/start.js'
import { handleLink } from './handlers/link.js'
import { handleHelp } from './handlers/help.js'
import { routeByIntent } from './intent/route-intent.js'
import { handleReaction } from './handlers/handle-reaction.js'
import { handleReply } from './handlers/handle-reply.js'
import { handleInboxCommand } from './handlers/inbox-command.js'
import { handleSearchCommand } from './handlers/search-command.js'
import { handleNewCommand } from './handlers/new-command.js'
import { loadOnboardingPhase } from './onboarding/load-onboarding.js'
import { handleOnboarding } from './onboarding/handle-onboarding.js'
import { shouldFastTrack } from './intent/should-fast-track.js'

const token = process.env['TELEGRAM_BOT_TOKEN']
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required')
}

export const bot = new Bot<BotContext>(token)

// Commands that work for unlinked users
bot.command('start', handleStart)
bot.command('link', handleLink)
bot.command('help', handleHelp)

// Authenticated commands
bot.command('inbox', requireLinkedUser, handleInboxCommand)
bot.command('search', requireLinkedUser, handleSearchCommand)
bot.command('new', requireLinkedUser, handleNewCommand)

// Reaction handler (requires linked user)
bot.on('message_reaction', requireLinkedUser, handleReaction)

// Message handlers require a linked account
// Reply-to-receipt takes priority over general message handler
bot.on('message', requireLinkedUser, async (ctx, next) => {
  if (ctx.message?.reply_to_message) {
    await handleReply(ctx)
    return
  }
  await next()
})

// Onboarding interception — before routeByIntent
bot.on('message', requireLinkedUser, async (ctx, next) => {
  const userId = ctx.userId
  if (!userId) { await next(); return }

  const phase = await loadOnboardingPhase(userId)
  if (!phase) { await next(); return }

  // If content (attachment/URL), let it save normally then nudge
  if (shouldFastTrack(ctx)) {
    await routeByIntent(ctx)
    await ctx.reply(`Saved that! By the way, I'm still setting up your folders. We're on the ${phase} step — just reply when you're ready to continue.`)
    return
  }

  await handleOnboarding(ctx)
})

bot.on('message', routeByIntent)

bot.start()
console.log('Bot started')
