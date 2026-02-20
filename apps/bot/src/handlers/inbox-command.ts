import { countInboxNotes, getInboxNotes } from '@second-brain/db'
import type { BotContext } from '../context.js'

const WEB_APP_URL = process.env['WEB_APP_URL'] || 'http://localhost:5173'

export async function handleInboxCommand(ctx: BotContext): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const [count, { data: recent }] = await Promise.all([
    countInboxNotes(userId),
    getInboxNotes(userId, { limit: 3 }),
  ])

  if (count === 0) {
    await ctx.reply("Your inbox is empty. You're all caught up!")
    return
  }

  const lines = [`You have ${count} item${count === 1 ? '' : 's'} in your inbox.\n`]

  for (const note of recent) {
    const date = new Date(note.captured_at).toLocaleDateString()
    const icon = sourceIcon(note.source_type)
    lines.push(`${icon} ${note.title} — ${date}`)
  }

  if (count > 3) {
    lines.push(`\n…and ${count - 3} more`)
  }

  lines.push(`\nProcess your inbox: ${WEB_APP_URL}/inbox`)

  await ctx.reply(lines.join('\n'))
}

function sourceIcon(type: string): string {
  const icons: Record<string, string> = {
    article: '📰',
    tweet: '🐦',
    thread: '🧵',
    reel: '🎬',
    youtube: '▶️',
    pdf: '📄',
    voice_memo: '🎙️',
    image: '🖼️',
    thought: '💭',
    document: '📎',
  }
  return icons[type] ?? '📝'
}
