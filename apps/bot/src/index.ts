import { Bot } from 'grammy'
import type { BotContext } from './context.js'
import { requireLinkedUser } from './middleware/auth.js'
import { handleStart } from './handlers/start.js'
import { handleLink } from './handlers/link.js'
import { handleHelp } from './handlers/help.js'
import { handleMessage } from './handlers/message.js'

const token = process.env['TELEGRAM_BOT_TOKEN']
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required')
}

export const bot = new Bot<BotContext>(token)

// Commands that work for unlinked users
bot.command('start', handleStart)
bot.command('link', handleLink)
bot.command('help', handleHelp)

// All message handlers require a linked account
bot.on('message', requireLinkedUser, handleMessage)

bot.start()
console.log('Bot started')
