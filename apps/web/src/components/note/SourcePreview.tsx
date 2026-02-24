import { TextPreview } from './previews/TextPreview'
import { ArticlePreview } from './previews/ArticlePreview'
import { TweetPreview } from './previews/TweetPreview'
import { YoutubePreview } from './previews/YoutubePreview'
import { MediaPreview } from './previews/MediaPreview'
import { FilePreview } from './previews/FilePreview'

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
      return <TweetPreview source={source} originalContent={originalContent} />
    case 'youtube':
      return <YoutubePreview source={source} originalContent={originalContent} />
    case 'reel':
    case 'image':
      return <MediaPreview sourceType={sourceType} source={source} originalContent={originalContent} />
    case 'pdf':
    case 'document':
    case 'voice_memo':
      return <FilePreview sourceType={sourceType} source={source} originalContent={originalContent} />
    case 'thought':
    default:
      return <TextPreview url={url} originalContent={originalContent} />
  }
}
