import type { BotContext } from '../../context.js'
import type { MoveNoteIntent } from '@second-brain/shared'

/** Stub — replaced in Phase C.6 */
export async function handleMoveNote(ctx: BotContext, _intent: MoveNoteIntent): Promise<void> {
  await ctx.reply('Move note handler not yet implemented.')
}
