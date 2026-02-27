import {
  findValidLinkCode,
  lookupUserByTelegramId,
  createTelegramLink,
  markLinkCodeUsed,
} from '@second-brain/db'
import type { BotContext } from '../context.js'
import { cacheUserId } from '../middleware/user-cache.js'
import { sendChatMessage } from '../api-client.js'

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
  const linkCode = await findValidLinkCode(code)

  if (!linkCode) {
    throw new LinkError(
      "that code doesn't match, was already used, or expired — generate a new one from settings",
    )
  }

  // Create link first — UNIQUE(telegram_user_id) constraint prevents double-linking.
  // Mark code used only after link succeeds so a transient failure doesn't burn the code.
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

  cacheUserId(telegramId, userId)
  ctx.userId = userId
  console.log(`[link] linked telegram=${telegramId} to user=${userId}`)
  await ctx.reply("linked — let's set up your second brain.")

  // Start onboarding via API — failures are non-fatal
  try {
    const response = await sendChatMessage({
      userId,
      message: '/start',
      startOnboarding: true,
      platform: 'Telegram',
    })
    await ctx.reply(response.text)
  } catch (error) {
    console.error('[link] onboarding failed after successful link:', error)
  }
}
