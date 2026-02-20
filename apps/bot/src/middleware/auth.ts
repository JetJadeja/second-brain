import type { NextFunction } from 'grammy'
import { lookupUserByTelegramId } from '@second-brain/db'
import type { BotContext } from '../context.js'
import { getCachedUserId, cacheUserId } from './user-cache.js'

const WEB_APP_URL = process.env['WEB_APP_URL'] || 'http://localhost:5173'

export async function requireLinkedUser(
  ctx: BotContext,
  next: NextFunction,
): Promise<void> {
  const telegramId = ctx.from?.id
  if (!telegramId) return

  // Check cache first
  const cached = getCachedUserId(telegramId)
  if (cached) {
    ctx.userId = cached
    await next()
    return
  }

  // Cache miss — query database
  const userId = await lookupUserByTelegramId(telegramId)

  if (!userId) {
    await ctx.reply(
      `I don't recognize this Telegram account. ` +
      `Connect it to your Second Brain at ${WEB_APP_URL}/settings`,
    )
    return
  }

  cacheUserId(telegramId, userId)
  ctx.userId = userId
  await next()
}
