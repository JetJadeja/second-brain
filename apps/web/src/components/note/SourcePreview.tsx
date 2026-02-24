import { TextPreview } from './previews/TextPreview'
import { ArticlePreview } from './previews/ArticlePreview'

interface SourcePreviewProps {
  sourceType: string
  source: Record<string, unknown>
  originalContent: string | null
}

export function SourcePreview({ sourceType, source, originalContent }: SourcePreviewProps) {
  const url = source['url'] as string | undefined

  switch (sourceType) {
    case 'article':
      return <ArticlePreview source={source} originalContent={originalContent} />
    case 'tweet':
    case 'thread':
    case 'youtube':
    case 'reel':
    case 'image':
    case 'pdf':
    case 'document':
    case 'voice_memo':
    case 'thought':
    default:
      return <TextPreview url={url} originalContent={originalContent} />
  }
}
