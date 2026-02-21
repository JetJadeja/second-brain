import { getNoteById, updateNote, getAllBuckets } from '@second-brain/db'
import type { BotContext } from '../../context.js'
import type { MoveNoteIntent, ParaBucket } from '@second-brain/shared'
import { getReceiptNoteId } from '../../handlers/receipt-store.js'
import { getBucketPath } from '../../handlers/resolve-bucket-path.js'
import { recordBotResponse } from '../../conversation/record-exchange.js'

export async function handleMoveNote(ctx: BotContext, intent: MoveNoteIntent): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const noteId = resolveNoteId(ctx, intent)
  if (!noteId) {
    await ctx.reply("I'm not sure which note you mean. Try replying to the receipt, or be more specific.")
    return
  }

  const note = await getNoteById(userId, noteId)
  if (!note) {
    await ctx.reply("I couldn't find that note.")
    return
  }

  const buckets = await getAllBuckets(userId)
  const targetBucket = findTargetBucket(buckets, intent.target_path)

  if (!targetBucket) {
    await ctx.reply(`I couldn't find a bucket matching "${intent.target_path}".`)
    return
  }

  await updateNote(userId, noteId, {
    bucket_id: targetBucket.id,
    is_classified: true,
  } as Record<string, unknown>)

  const path = await getBucketPath(userId, targetBucket.id)
  await ctx.reply(`Moved "${note.title}" to ${path ?? targetBucket.name}.`)

  recordBotResponse(userId, `Moved '${note.title}' to ${path ?? targetBucket.name}`, [noteId])
}

/**
 * Resolves the note ID using two strategies:
 * 1. Reply-to path: user replied to a receipt message
 * 2. Context path: LLM resolved from conversation history (note_refs)
 */
function resolveNoteId(ctx: BotContext, intent: MoveNoteIntent): string | null {
  // Try reply-to first (most specific)
  const replyTo = ctx.message?.reply_to_message
  const chatId = ctx.chat?.id
  if (replyTo && chatId) {
    const receiptNoteId = getReceiptNoteId(chatId, replyTo.message_id)
    if (receiptNoteId) return receiptNoteId
  }

  // Fall back to note_refs from conversation context
  if (intent.note_refs.length > 0) {
    return intent.note_refs[0]!
  }

  return null
}

function findTargetBucket(buckets: ParaBucket[], targetPath: string): ParaBucket | null {
  const lower = targetPath.toLowerCase().trim()

  const exactMatch = buckets.find((b) => b.name.toLowerCase() === lower)
  if (exactMatch) return exactMatch

  const segments = lower.split(/\s*>\s*/).map((s) => s.trim())
  const lastName = segments[segments.length - 1]
  if (!lastName) return null

  const nameMatches = buckets.filter((b) => b.name.toLowerCase() === lastName)
  if (nameMatches.length === 1) return nameMatches[0]!

  for (const candidate of nameMatches) {
    if (matchesPathSegments(buckets, candidate, segments)) return candidate
  }

  return nameMatches[0] ?? null
}

function matchesPathSegments(
  buckets: ParaBucket[],
  bucket: ParaBucket,
  segments: string[],
): boolean {
  let current: ParaBucket | undefined = bucket
  for (let i = segments.length - 1; i >= 0; i--) {
    if (!current || current.name.toLowerCase() !== segments[i]) return false
    current = current.parent_id
      ? buckets.find((b) => b.id === current!.parent_id)
      : undefined
  }
  return true
}
