import { lookupUserByTelegramId, countUserBuckets } from '@second-brain/db'
import type { BotContext } from '../context.js'
import { startOnboarding } from '../onboarding/start-onboarding.js'
import { runAgent } from '../agent/run-agent.js'
import { cacheUserId } from '../middleware/user-cache.js'
import { recordBotResponse } from '../conversation/record-exchange.js'

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

  const bucketCount = await countUserBuckets(userId)

  if (bucketCount < MIN_BUCKET_COUNT) {
    ctx.userId = userId
    cacheUserId(telegramId, userId)
    await startOnboarding(userId)

    // Let the agent send the first onboarding message
    const result = await runAgent(ctx)
    await ctx.reply(result.text)
    recordBotResponse(userId, result.text)
    return
  }

  await ctx.reply(
    'Welcome back! Send me anything — links, thoughts, images — ' +
    "and I'll save it to your second brain.",
  )
}
