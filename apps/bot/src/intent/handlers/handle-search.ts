import type { BotContext } from '../../context.js'
import type { SearchIntent } from '@second-brain/shared'

/** Stub — replaced in Phase C.2 */
export async function handleSearch(ctx: BotContext, _intent: SearchIntent): Promise<void> {
  await ctx.reply('Search handler not yet implemented.')
}
