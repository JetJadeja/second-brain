import { useState } from 'react'
import { SourceLink } from './SourceLink'
import { getStorageUrl } from '../../../lib/storage-url'

interface MediaPreviewProps {
  sourceType: string
  source: Record<string, unknown>
  originalContent: string | null
}

export function MediaPreview({ sourceType, source, originalContent }: MediaPreviewProps) {
  const url = source['url'] as string | undefined
  const domain = source['domain'] as string | undefined
  const thumbnailUrl = source['thumbnail_url'] as string | undefined
  const storagePath = source['storage_path'] as string | undefined
  const description = source['media_description'] as string | undefined
  const [imgError, setImgError] = useState(false)

  const imgSrc = sourceType === 'image' && storagePath
    ? getStorageUrl(storagePath)
    : thumbnailUrl

  return (
    <div className="flex flex-col gap-3">
      {url && <SourceLink url={url} domain={domain} />}

      {imgSrc && !imgError && (
        <img
          src={imgSrc}
          alt={description ?? ''}
          className="w-full max-h-72 object-contain rounded-lg bg-hover"
          onError={() => setImgError(true)}
        />
      )}

      {description && (
        <p className="text-xs text-text-tertiary italic">{description}</p>
      )}

      {originalContent && !description && (
        <div className="text-sm text-text-secondary whitespace-pre-wrap">
          {originalContent}
        </div>
      )}
    </div>
  )
}
