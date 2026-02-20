import { lookupUserByTelegramId } from '@second-brain/db'
import type { BotContext } from '../context.js'

const WEB_APP_URL = process.env['WEB_APP_URL'] || 'http://localhost:5173'

export async function handleStart(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id
  if (!telegramId) return

  const userId = await lookupUserByTelegramId(telegramId)

  if (userId) {
    await ctx.reply(
      'Welcome back! Send me anything — links, thoughts, images — ' +
      "and I'll save it to your second brain.",
    )
  } else {
    await ctx.reply(
      'Welcome! To get started, connect your Telegram account:\n\n' +
      `1) Go to ${WEB_APP_URL}/settings\n` +
      "2) Click 'Connect Telegram'\n" +
      '3) Send me /link YOUR_CODE',
    )
  }
}
