import type { BotContext } from '../../context.js'
import type { CreateBucketIntent } from '@second-brain/shared'

/** Stub — replaced in Phase C.5 */
export async function handleCreateBucket(ctx: BotContext, _intent: CreateBucketIntent): Promise<void> {
  await ctx.reply('Create bucket handler not yet implemented.')
}
