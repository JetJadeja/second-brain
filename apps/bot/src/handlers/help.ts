import type { BotContext } from '../context.js'

export async function handleHelp(ctx: BotContext): Promise<void> {
  await ctx.reply(
    'Available commands:\n\n' +
    '/start — Check connection status\n' +
    '/link CODE — Connect your Telegram account\n' +
    '/help — Show this help message\n\n' +
    'Just send me a link, thought, image, or voice memo. ' +
    "I'll save it and organize it for you.",
  )
}
