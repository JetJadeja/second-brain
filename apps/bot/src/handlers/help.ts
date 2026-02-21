import type { BotContext } from '../context.js'

export async function handleHelp(ctx: BotContext): Promise<void> {
  await ctx.reply(
    'Commands:\n\n' +
    '/inbox — View your inbox status\n' +
    '/search QUERY — Search your knowledge base\n' +
    '/new project|area NAME — Create a new folder\n' +
    '/link CODE — Connect your Telegram account\n' +
    '/help — Show this message\n\n' +
    'Or just talk to me naturally:\n\n' +
    '"What\'s in my inbox?"\n' +
    '"Search for coffee articles"\n' +
    '"Create a project called Kitchen Reno"\n' +
    '"Add a resource folder for AI"\n\n' +
    'Send me links, thoughts, images, or voice memos ' +
    "and I'll save and organize them for you.\n\n" +
    'Reply to a receipt with "Move this to [folder]" to reclassify.',
  )
}
