import { Bot } from 'grammy'
import type { BotContext } from './context.js'

const token = process.env['TELEGRAM_BOT_TOKEN']
if (!token) {
  throw new Error('TELEGRAM_BOT_TOKEN is required')
}

export const bot = new Bot<BotContext>(token)

bot.command('start', (ctx) => ctx.reply('Second Brain bot is running.'))

bot.start()
console.log('Bot started')
