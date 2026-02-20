import {
  findLinkCodeByCode,
  lookupUserByTelegramId,
  createTelegramLink,
  markLinkCodeUsed,
} from '@second-brain/db'
import type { BotContext } from '../context.js'
import { cacheUserId } from '../middleware/user-cache.js'

const WEB_APP_URL = process.env['WEB_APP_URL'] || 'http://localhost:5173'

export async function handleLink(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id
  if (!telegramId) return

  const code = (ctx.match as string)?.trim()
  if (!code) {
    await ctx.reply('Please include your link code. Example: /link A7K2M9')
    return
  }

  // Check if already linked
  const existingUserId = await lookupUserByTelegramId(telegramId)
  if (existingUserId) {
    await ctx.reply('This Telegram account is already linked to a Second Brain.')
    return
  }

  // Look up the code
  const linkCode = await findLinkCodeByCode(code.toUpperCase())

  if (!linkCode) {
    await ctx.reply(
      `Invalid code. Please generate a new one from ${WEB_APP_URL}/settings`,
    )
    return
  }

  if (linkCode.used) {
    await ctx.reply(
      `Invalid code. Please generate a new one from ${WEB_APP_URL}/settings`,
    )
    return
  }

  if (new Date(linkCode.expires_at) < new Date()) {
    await ctx.reply(
      `This code has expired. Please generate a new one from ${WEB_APP_URL}/settings`,
    )
    return
  }

  // All valid — create the link
  const username = ctx.from?.username
  await createTelegramLink(linkCode.user_id, telegramId, username)
  await markLinkCodeUsed(linkCode.id)
  cacheUserId(telegramId, linkCode.user_id)

  await ctx.reply(
    "Your Telegram is connected! Send me anything and I'll save it to your second brain.",
  )
}
