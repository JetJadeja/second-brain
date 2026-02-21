import { generateEmbedding } from '@second-brain/ai'
import { hybridSearch } from '@second-brain/db'
import type { BotContext } from '../../context.js'
import type { SearchIntent } from '@second-brain/shared'
import { getBucketPath } from '../../handlers/resolve-bucket-path.js'

const WEB_APP_URL = process.env['WEB_APP_URL'] || 'http://localhost:5173'

export async function handleSearch(ctx: BotContext, intent: SearchIntent): Promise<void> {
  const userId = ctx.userId
  if (!userId) return

  const query = intent.query
  if (!query.trim()) {
    await ctx.reply("I couldn't understand what you want to search for. Try again?")
    return
  }

  const embedding = await generateEmbedding(query)
  if (!embedding) {
    await ctx.reply("Couldn't process your search. Please try again.")
    return
  }

  try {
    const results = await hybridSearch({
      userId,
      queryText: query,
      queryEmbedding: embedding,
      matchCount: 3,
    })

    if (results.length === 0) {
      await ctx.reply(`No results found for "${query}".`)
      return
    }

    const lines = [`Found ${results.length} result${results.length === 1 ? '' : 's'}:\n`]

    for (const result of results) {
      const excerpt = buildExcerpt(result.distillation ?? result.ai_summary ?? result.original_content)
      const bucketPath = await getBucketPath(userId, result.bucket_id)
      const location = bucketPath ? ` · ${bucketPath}` : ''
      lines.push(`• ${result.title}${location}`)
      if (excerpt) lines.push(`  ${excerpt}`)
      lines.push('')
    }

    lines.push(`Full search: ${WEB_APP_URL}/search`)
    await ctx.reply(lines.join('\n'))
  } catch (error) {
    console.error('[handleSearch] Failed:', error)
    await ctx.reply('Search failed. Please try again.')
  }
}

function buildExcerpt(text: string | null | undefined): string {
  if (!text) return ''
  const clean = text.replace(/\n+/g, ' ').trim()
  return clean.length > 100 ? clean.slice(0, 97) + '...' : clean
}
