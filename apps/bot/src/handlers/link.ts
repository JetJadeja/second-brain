import {
  findLinkCodeByCode,
  lookupUserByTelegramId,
  createTelegramLink,
  markLinkCodeUsed,
} from '@second-brain/db'
import type { BotContext } from '../context.js'
import { cacheUserId } from '../middleware/user-cache.js'
import { startOnboarding } from '../onboarding/start-onboarding.js'
import { runAgent } from '../agent/run-agent.js'
import { recordBotResponse } from '../conversation/record-exchange.js'

class LinkError extends Error {}

async function validateAndLink(
  telegramId: number,
  rawCode: string,
  username?: string,
): Promise<string> {
  const existingUserId = await lookupUserByTelegramId(telegramId)
  if (existingUserId) {
    throw new LinkError('this account is already connected')
  }

  const code = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const linkCode = await findLinkCodeByCode(code)

  if (!linkCode) {
    throw new LinkError(
      "that code doesn't match — check the code in your settings page and try again",
    )
  }

  if (linkCode.used) {
    throw new LinkError(
      'that code was already used — generate a new one from settings',
    )
  }

  if (new Date(linkCode.expires_at) < new Date()) {
    throw new LinkError(
      'that code expired — generate a new one from settings',
    )
  }

  await createTelegramLink(linkCode.user_id, telegramId, username)
  await markLinkCodeUsed(linkCode.id)

  return linkCode.user_id
}

export async function handleLink(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id
  if (!telegramId) return

  const code = (ctx.match as string)?.trim()
  if (!code) {
    await ctx.reply('send the code after /link, like: /link A7K2M9')
    return
  }

  // Phase 1: Validate and create link
  let userId: string
  try {
    userId = await validateAndLink(telegramId, code, ctx.from?.username)
  } catch (error) {
    if (error instanceof LinkError) {
      await ctx.reply(error.message)
    } else {
      console.error('[link] unexpected error:', error)
      await ctx.reply(
        'something went wrong connecting your account — try again in a moment',
      )
    }
    return
  }

  // Phase 2: Confirm to user
  cacheUserId(telegramId, userId)
  ctx.userId = userId
  console.log(`[link] linked telegram=${telegramId} to user=${userId}`)
  await ctx.reply("linked — let's set up your second brain.")

  // Phase 3: Start onboarding — failures are non-fatal
  try {
    await startOnboarding(userId)
    const result = await runAgent(ctx)
    await ctx.reply(result.text)
    recordBotResponse(userId, result.text)
  } catch (error) {
    console.error('[link] onboarding failed after successful link:', error)
  }
}
