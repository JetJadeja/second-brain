import { getAllBuckets, createBucket } from '@second-brain/db'
import type { BotContext } from '../context.js'

export async function handleNewCommand(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const args = (ctx.match as string | undefined)?.trim()
  if (!args) {
    await ctx.reply(
      'Usage:\n' +
      '/new project <name> — Create a new project\n' +
      '/new area <name> — Create a new area',
    )
    return
  }

  const { type, name } = parseArgs(args)

  if (!type) {
    await ctx.reply(
      'Please specify "project" or "area".\n' +
      'Example: /new project My Project Name',
    )
    return
  }

  if (!name) {
    await ctx.reply(`Please include a name. Example: /new ${type} My ${capitalize(type)}`)
    return
  }

  if (name.length > 100) {
    await ctx.reply('Name is too long (max 100 characters).')
    return
  }

  try {
    const buckets = await getAllBuckets(userId)
    const parentBucket = buckets.find(
      (b) => b.type === type && b.parent_id === null,
    )

    if (!parentBucket) {
      await ctx.reply(`Couldn't find your ${capitalize(type)}s container. Please create it from the web app.`)
      return
    }

    const created = await createBucket(userId, {
      name,
      type,
      parent_id: parentBucket.id,
    })

    await ctx.reply(`Created ${type} "${created.name}"`)
  } catch (error) {
    console.error('New command failed:', error)
    await ctx.reply(`Failed to create ${type}. Please try again.`)
  }
}

function parseArgs(args: string): { type: 'project' | 'area' | null; name: string } {
  const lower = args.toLowerCase()

  if (lower.startsWith('project ')) {
    return { type: 'project', name: args.slice('project '.length).trim() }
  }
  if (lower.startsWith('area ')) {
    return { type: 'area', name: args.slice('area '.length).trim() }
  }

  return { type: null, name: args }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
