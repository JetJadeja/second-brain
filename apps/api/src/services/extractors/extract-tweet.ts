import type { ExtractedContent, TweetSource, ThreadSource } from '@second-brain/shared'
import type { ExtractionResult } from './extract-article.js'

interface FxTweetResponse {
  code: number
  message: string
  tweet?: {
    text: string
    author: {
      name: string
      screen_name: string
    }
    media?: {
      all: Array<{ url: string; type: string }>
    }
    replies?: number
    quote?: {
      text: string
      author: { name: string; screen_name: string }
    }
    thread?: Array<{
      text: string
      author: { name: string; screen_name: string }
    }>
  }
}

export async function extractTweet(url: string): Promise<ExtractionResult> {
  const tweetPath = parseTweetPath(url)
  const fallback = buildFallback(url)

  if (!tweetPath) {
    return { content: fallback, warning: "Couldn't parse this tweet URL. Saved the link." }
  }

  let data: FxTweetResponse
  try {
    const res = await fetch(`https://api.fxtwitter.com/${tweetPath}`, {
      signal: AbortSignal.timeout(10_000),
    })
    data = await res.json() as FxTweetResponse
  } catch {
    return { content: fallback, warning: "Couldn't extract tweet content. Saved the link." }
  }

  if (!data.tweet) {
    return { content: fallback, warning: "Couldn't extract tweet content. Saved the link." }
  }

  const tweet = data.tweet
  const authorHandle = tweet.author.screen_name
  const isThread = tweet.thread && tweet.thread.length > 1

  if (isThread && tweet.thread) {
    const threadText = tweet.thread
      .map((t, i) => `[${i + 1}/${tweet.thread!.length}] ${t.text}`)
      .join('\n\n')

    const source: ThreadSource = {
      url,
      domain: 'x.com',
      author_handle: authorHandle,
      tweet_count: tweet.thread.length,
    }

    return {
      content: {
        title: `Thread by @${authorHandle}: ${tweet.text.slice(0, 60)}...`,
        content: threadText,
        sourceType: 'thread',
        source,
      },
    }
  }

  const source: TweetSource = {
    url,
    domain: 'x.com',
    author_handle: authorHandle,
  }

  const { content, title } = buildTweetContent(tweet, authorHandle)

  return {
    content: {
      title,
      content,
      sourceType: 'tweet',
      source,
    },
  }
}

function buildTweetContent(
  tweet: NonNullable<FxTweetResponse['tweet']>,
  authorHandle: string,
): { content: string; title: string } {
  if (tweet.quote) {
    const quotedHandle = tweet.quote.author.screen_name
    const content = `${tweet.text}\n\nQuote tweet by @${quotedHandle}:\n${tweet.quote.text}`
    return { content, title: truncateTitle(tweet.quote.text) }
  }

  return {
    content: tweet.text,
    title: truncateTitle(tweet.text),
  }
}

function truncateTitle(text: string, maxLen = 80): string {
  const clean = text.replace(/\n+/g, ' ').trim()
  if (clean.length <= maxLen) return clean
  const truncated = clean.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > maxLen * 0.5 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

function parseTweetPath(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.pathname.replace(/^\//, '')
  } catch {
    return null
  }
}

function buildFallback(url: string): ExtractedContent {
  return {
    title: 'Tweet',
    content: '',
    sourceType: 'tweet',
    source: { url, domain: 'x.com' } as TweetSource,
  }
}
