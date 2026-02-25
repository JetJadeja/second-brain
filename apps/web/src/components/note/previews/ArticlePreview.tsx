import { useState } from 'react'
import { SourceLink } from './SourceLink'

interface ArticlePreviewProps {
  source: Record<string, unknown>
  originalContent: string | null
}

export function ArticlePreview({ source, originalContent }: ArticlePreviewProps) {
  const url = source['url'] as string | undefined
  const domain = source['domain'] as string | undefined
  const author = source['author'] as string | undefined
  const thumbnailUrl = source['thumbnail_url'] as string | undefined
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      {url && <SourceLink url={url} domain={domain} />}

      {author && (
        <span className="text-xs text-text-tertiary">by {author}</span>
      )}

      {thumbnailUrl && !imgError && (
        <img
          src={thumbnailUrl}
          alt=""
          className="w-full max-h-48 object-cover rounded-lg"
          onError={() => setImgError(true)}
        />
      )}

      {originalContent && (
        <details>
          <summary className="text-sm text-text-tertiary cursor-pointer hover:text-text-secondary">
            Full article text
          </summary>
          <div className="mt-3 text-sm text-text-secondary whitespace-pre-wrap">
            {originalContent}
          </div>
        </details>
      )}
    </div>
  )
}
