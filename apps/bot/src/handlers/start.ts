import { lookupUserByTelegramId, countUserBuckets } from '@second-brain/db'
import type { BotContext } from '../context.js'
import { sendChatMessage } from '../api-client.js'
import { cacheUserId } from '../middleware/user-cache.js'

const WEB_APP_URL = process.env['WEB_APP_URL'] || 'http://localhost:5173'
const MIN_BUCKET_COUNT = 5 // 4 root containers + at least 1 subfolder

export async function handleStart(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id
  if (!telegramId) return

  const userId = await lookupUserByTelegramId(telegramId)

  if (!userId) {
    await ctx.reply(
      `hey! to get started, link your account at ${WEB_APP_URL}/settings — then send me the code with /link`,
    )
    return
  }

  const bucketCount = await countUserBuckets(userId)

  if (bucketCount < MIN_BUCKET_COUNT) {
    ctx.userId = userId
    cacheUserId(telegramId, userId)

    // Let the API handle onboarding initialization + first message
    const response = await sendChatMessage({
      userId,
      message: '/start',
      startOnboarding: true,
      platform: 'Telegram',
    })
    await ctx.reply(response.text)
    return
  }

  await ctx.reply("hey — send me anything and I'll organize it")
}
