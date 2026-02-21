import { getAllBuckets, createBucket } from '@second-brain/db'
import type { BotContext } from '../../context.js'
import type { CreateBucketIntent, ParaBucket } from '@second-brain/shared'
import { getBucketPath } from '../../handlers/resolve-bucket-path.js'
import { recordBotResponse } from '../../conversation/record-exchange.js'

export async function handleCreateBucket(ctx: BotContext, intent: CreateBucketIntent): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const { bucket_name, bucket_type, parent_name } = intent

  if (!bucket_name.trim()) {
    await ctx.reply("I couldn't determine a name for the bucket. Please try again.")
    return
  }

  if (bucket_name.length > 100) {
    await ctx.reply('That name is too long (max 100 characters).')
    return
  }

  try {
    const buckets = await getAllBuckets(userId)
    const parentId = resolveParentId(buckets, bucket_type, parent_name)

    if (!parentId) {
      const target = parent_name
        ? `"${parent_name}"`
        : `${bucket_type}s container`
      await ctx.reply(`Couldn't find your ${target}. Please create it from the web app first.`)
      return
    }

    const created = await createBucket(userId, {
      name: bucket_name.trim(),
      type: bucket_type,
      parent_id: parentId,
    })

    const path = await getBucketPath(userId, created.id)
    await ctx.reply(`Created ${bucket_type} "${created.name}" under ${path ?? bucket_type}.`)

    recordBotResponse(userId, `Created ${bucket_type} '${created.name}' under ${path ?? bucket_type}`)
  } catch (error) {
    console.error('[handleCreateBucket] Failed:', error)
    await ctx.reply('Failed to create the bucket. Please try again.')
  }
}

function resolveParentId(
  buckets: ParaBucket[],
  bucketType: string,
  parentName: string | null,
): string | null {
  if (parentName) {
    return findBucketByName(buckets, parentName)
  }
  return findRootContainer(buckets, bucketType)
}

function findBucketByName(buckets: ParaBucket[], name: string): string | null {
  const lower = name.toLowerCase()
  const match = buckets.find((b) => b.name.toLowerCase() === lower)
  return match?.id ?? null
}

function findRootContainer(buckets: ParaBucket[], type: string): string | null {
  const root = buckets.find((b) => b.type === type && b.parent_id === null)
  return root?.id ?? null
}
