import { Bot } from 'grammy'
import type { BotContext } from './context.js'
import { requireLinkedUser } from './middleware/auth.js'
import { handleStart } from './handlers/start.js'
import { handleLink } from './handlers/link.js'
import { handleReaction } from './handlers/handle-reaction.js'
import { handleReply } from './handlers/handle-reply.js'
import { runAgentHandler } from './handlers/agent-handler.js'

const token = process.env['TELEGRAM_BOT_TOKEN']
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required')
}

export const bot = new Bot<BotContext>(token)

// Commands that work for unlinked users
bot.command('start', handleStart)
bot.command('link', handleLink)

// Reaction handler (requires linked user)
bot.on('message_reaction', requireLinkedUser, handleReaction)

// Reply-to-receipt takes priority over general message handler
bot.on('message', requireLinkedUser, async (ctx, next) => {
  if (ctx.message?.reply_to_message) {
    await handleReply(ctx)
    return
  }
  await next()
})

// Main message handler — the agent handles everything (including onboarding)
bot.on('message', requireLinkedUser, runAgentHandler)

bot.start()
console.log('Bot started')
