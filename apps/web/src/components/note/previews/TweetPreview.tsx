import { SourceLink } from './SourceLink'

interface TweetPreviewProps {
  source: Record<string, unknown>
  originalContent: string | null
}

const QUOTE_PATTERN = /\n\nQuote tweet by @(\w+):\n([\s\S]+)$/

export function TweetPreview({ source, originalContent }: TweetPreviewProps) {
  const url = source['url'] as string | undefined
  const authorHandle = source['author_handle'] as string | undefined
  const tweetCount = source['tweet_count'] as number | undefined

  const { mainText, quotedHandle, quotedText } = parseQuoteTweet(originalContent)

  return (
    <div className="border-l-2 border-blue-400 pl-4 flex flex-col gap-3">
      {url && <SourceLink url={url} label="View on X" />}

      {authorHandle && (
        <span className="text-sm font-semibold text-text-primary">@{authorHandle}</span>
      )}

      {tweetCount && tweetCount > 1 && (
        <span className="text-xs text-text-tertiary">{tweetCount} tweets in thread</span>
      )}

      {mainText && (
        <div className="text-sm text-text-secondary whitespace-pre-wrap">{mainText}</div>
      )}

      {quotedHandle && quotedText && (
        <div className="border-l-2 border-border pl-3 ml-2">
          <span className="text-xs font-semibold text-text-tertiary">@{quotedHandle}</span>
          <div className="text-sm text-text-tertiary whitespace-pre-wrap mt-1">{quotedText}</div>
        </div>
      )}
    </div>
  )
}

function parseQuoteTweet(content: string | null): {
  mainText: string | null
  quotedHandle: string | null
  quotedText: string | null
} {
  if (!content) return { mainText: null, quotedHandle: null, quotedText: null }

  const match = content.match(QUOTE_PATTERN)
  if (!match) return { mainText: content, quotedHandle: null, quotedText: null }

  return {
    mainText: content.slice(0, match.index!).trimEnd(),
    quotedHandle: match[1]!,
    quotedText: match[2]!.trim(),
  }
}
