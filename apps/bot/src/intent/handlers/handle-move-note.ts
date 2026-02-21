import { getNoteById, updateNote, getAllBuckets } from '@second-brain/db'
import type { BotContext } from '../../context.js'
import type { MoveNoteIntent, ParaBucket } from '@second-brain/shared'
import { getReceiptNoteId } from '../../handlers/receipt-store.js'
import { getBucketPath } from '../../handlers/resolve-bucket-path.js'
import { recordBotResponse } from '../../conversation/record-exchange.js'

export async function handleMoveNote(ctx: BotContext, intent: MoveNoteIntent): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const replyTo = ctx.message?.reply_to_message
  const chatId = ctx.chat?.id
  if (!replyTo || !chatId) {
    await ctx.reply("I can only move notes when you reply to a receipt message.")
    return
  }

  const noteId = getReceiptNoteId(chatId, replyTo.message_id)
  if (!noteId) {
    await ctx.reply("I couldn't find the note for that message. It may have expired.")
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

function findTargetBucket(buckets: ParaBucket[], targetPath: string): ParaBucket | null {
  const lower = targetPath.toLowerCase().trim()

  // Try exact name match first
  const exactMatch = buckets.find((b) => b.name.toLowerCase() === lower)
  if (exactMatch) return exactMatch

  // Try matching by path segments (e.g., "Resources > Cars")
  const segments = lower.split(/\s*>\s*/).map((s) => s.trim())
  const lastName = segments[segments.length - 1]
  if (!lastName) return null

  const nameMatches = buckets.filter((b) => b.name.toLowerCase() === lastName)
  if (nameMatches.length === 1) return nameMatches[0]!

  // Multiple matches — try matching parent chain
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
