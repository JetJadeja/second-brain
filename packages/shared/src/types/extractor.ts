import type { NoteSource } from './enums.js'

// === Per-content-type source JSONB shapes ===

export interface ArticleSource {
  url: string
  domain: string
  thumbnail_url?: string
  author?: string
}

export interface TweetSource {
  url: string
  domain: 'x.com'
  author_handle?: string
}

export interface ThreadSource {
  url: string
  domain: 'x.com'
  author_handle?: string
  tweet_count?: number
}

export interface ReelSource {
  url: string
  domain: 'instagram.com'
  thumbnail_url?: string
  media_description?: string
}

export interface YoutubeSource {
  url: string
  domain: 'youtube.com'
  thumbnail_url?: string
  channel?: string
}

export interface PdfSource {
  filename: string
  page_count?: number
  storage_path: string
}

export interface VoiceMemoSource {
  storage_path: string
  duration_seconds?: number
}

export interface ImageSource {
  storage_path: string
  media_description?: string
}

export interface ThoughtSource {
  [key: string]: never
}

export interface DocumentSource {
  filename: string
}

export type ContentSource =
  | ArticleSource
  | TweetSource
  | ThreadSource
  | ReelSource
  | YoutubeSource
  | PdfSource
  | VoiceMemoSource
  | ImageSource
  | ThoughtSource
  | DocumentSource

// === Unified extractor output ===

export interface ExtractedContent {
  title: string
  content: string
  sourceType: NoteSource
  source: ContentSource
  thumbnailUrl?: string
  mediaUrls?: string[]
}
