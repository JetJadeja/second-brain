import { lookupUserByTelegramId, countUserBuckets } from '@second-brain/db'
import type { BotContext } from '../context.js'
import { startOnboarding } from '../onboarding/start-onboarding.js'
import { cacheUserId } from '../middleware/user-cache.js'

const WEB_APP_URL = process.env['WEB_APP_URL'] || 'http://localhost:5173'
const MIN_BUCKET_COUNT = 5 // 4 root containers + at least 1 subfolder

export async function handleStart(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id
  if (!telegramId) return

  const userId = await lookupUserByTelegramId(telegramId)

  if (!userId) {
    await ctx.reply(
      'Welcome! To get started, connect your Telegram account:\n\n' +
      `1) Go to ${WEB_APP_URL}/settings\n` +
      "2) Click 'Connect Telegram'\n" +
      '3) Send me /link YOUR_CODE',
    )
    return
  }

  // Check if user has enough structure or needs onboarding
  const bucketCount = await countUserBuckets(userId)

  if (bucketCount < MIN_BUCKET_COUNT) {
    ctx.userId = userId
    cacheUserId(telegramId, userId)
    await ctx.reply(
      "Welcome back! I notice you don't have many folders set up yet. " +
      "Let me help you organize — it takes about 2 minutes.",
    )
    await startOnboarding(ctx)
    return
  }

  await ctx.reply(
    'Welcome back! Send me anything — links, thoughts, images — ' +
    "and I'll save it to your second brain.",
  )
}
