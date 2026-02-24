interface TextPreviewProps {
  url?: string
  originalContent: string | null
}

export function TextPreview({ url, originalContent }: TextPreviewProps) {
  return (
    <div className="flex flex-col gap-3">
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline truncate"
        >
          {url}
        </a>
      )}
      {originalContent && (
        <div className="text-sm text-text-secondary whitespace-pre-wrap">
          {originalContent}
        </div>
      )}
    </div>
  )
}
