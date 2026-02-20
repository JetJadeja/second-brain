import type { BotContext } from '../context.js'

export async function handleHelp(ctx: BotContext): Promise<void> {
  await ctx.reply(
    'Available commands:\n\n' +
    '/start — Check connection status\n' +
    '/link CODE — Connect your Telegram account\n' +
    '/inbox — View your inbox status\n' +
    '/search QUERY — Search your knowledge base\n' +
    '/new project NAME — Create a new project\n' +
    '/new area NAME — Create a new area\n' +
    '/help — Show this help message\n\n' +
    'Just send me a link, thought, image, or voice memo. ' +
    "I'll save it and organize it for you.",
  )
}
