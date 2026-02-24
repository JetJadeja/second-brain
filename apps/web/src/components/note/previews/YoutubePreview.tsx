import { useState } from 'react'
import { SourceLink } from './SourceLink'

interface YoutubePreviewProps {
  source: Record<string, unknown>
  originalContent: string | null
}

export function YoutubePreview({ source, originalContent }: YoutubePreviewProps) {
  const url = source['url'] as string | undefined
  const thumbnailUrl = source['thumbnail_url'] as string | undefined
  const channel = source['channel'] as string | undefined
  const [imgError, setImgError] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      {url && <SourceLink url={url} domain="youtube.com" />}

      {thumbnailUrl && !imgError && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={thumbnailUrl}
            alt=""
            className="w-full max-h-56 object-cover rounded-lg"
            onError={() => setImgError(true)}
          />
        </a>
      )}

      {channel && (
        <span className="text-xs text-text-tertiary">{channel}</span>
      )}

      {originalContent && (
        <details>
          <summary className="text-sm text-text-tertiary cursor-pointer hover:text-text-secondary">
            Transcript
          </summary>
          <div className="mt-3 text-sm text-text-secondary whitespace-pre-wrap">
            {originalContent}
          </div>
        </details>
      )}
    </div>
  )
}
