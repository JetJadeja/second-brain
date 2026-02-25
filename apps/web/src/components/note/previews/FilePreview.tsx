import { ExternalLink } from 'lucide-react'
import { SourceLink } from './SourceLink'
import { getStorageUrl } from '../../../lib/storage-url'

interface FilePreviewProps {
  sourceType: string
  source: Record<string, unknown>
  originalContent: string | null
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return mins > 0 ? `${mins} min ${secs} sec` : `${secs} sec`
}

export function FilePreview({ sourceType, source, originalContent }: FilePreviewProps) {
  const url = source['url'] as string | undefined
  const domain = source['domain'] as string | undefined
  const storagePath = source['storage_path'] as string | undefined
  const filename = source['filename'] as string | undefined
  const pageCount = source['page_count'] as number | undefined
  const duration = source['duration'] as number | undefined

  const label = sourceType === 'voice_memo'
    ? 'Voice Memo'
    : filename ?? 'File'

  return (
    <div className="flex flex-col gap-3">
      {url && <SourceLink url={url} domain={domain} />}

      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <span className="font-medium">{label}</span>
        {pageCount && <span className="text-text-tertiary">· {pageCount} pages</span>}
        {sourceType === 'voice_memo' && duration && (
          <span className="text-text-tertiary">· {formatDuration(duration)}</span>
        )}
      </div>

      {storagePath && (
        <a
          href={getStorageUrl(storagePath)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1"
        >
          <ExternalLink size={12} />
          View file
        </a>
      )}

      {originalContent && (
        <details>
          <summary className="text-sm text-text-tertiary cursor-pointer hover:text-text-secondary">
            {sourceType === 'voice_memo' ? 'Transcript' : 'Extracted text'}
          </summary>
          <div className="mt-3 text-sm text-text-secondary whitespace-pre-wrap">
            {originalContent}
          </div>
        </details>
      )}
    </div>
  )
}
