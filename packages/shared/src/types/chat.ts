import type { ExtractedContent } from './extractor.js'

export interface ChatRequest {
  userId: string
  message: string
  preExtracted?: ExtractedContent
  noteContext?: string
  startOnboarding?: boolean
  attachmentDescription?: string
  platform?: string
}

export interface ChatResponse {
  text: string
  noteIds: string[]
  deduplicated?: boolean
}
