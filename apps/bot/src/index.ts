import { Bot } from 'grammy'
import type { BotContext } from './context.js'
import { requireLinkedUser } from './middleware/auth.js'
import { handleStart } from './handlers/start.js'
import { handleLink } from './handlers/link.js'
import { handleHelp } from './handlers/help.js'
import { handleMessage } from './handlers/message.js'
import { handleReaction } from './handlers/handle-reaction.js'
import { handleReply } from './handlers/handle-reply.js'

const token = process.env['TELEGRAM_BOT_TOKEN']
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required')
}

export const bot = new Bot<BotContext>(token)

// Commands that work for unlinked users
bot.command('start', handleStart)
bot.command('link', handleLink)
bot.command('help', handleHelp)

// Reaction handler (requires linked user)
bot.on('message_reaction', requireLinkedUser, handleReaction)

// Message handlers require a linked account
// Reply-to-receipt takes priority over general message handler
bot.on('message', requireLinkedUser, async (ctx, next) => {
  if (ctx.message?.reply_to_message) {
    await handleReply(ctx)
    // If it was a receipt reply, we're done; otherwise fall through
    return
  }
  await next()
})

bot.on('message', handleMessage)

bot.start()
console.log('Bot started')
