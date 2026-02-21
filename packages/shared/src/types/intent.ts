import type { ParaType } from './enums.js'

export const INTENT_TYPES = [
  'save_content', 'search', 'create_bucket',
  'show_inbox', 'move_note', 'unknown',
] as const

export type IntentType = (typeof INTENT_TYPES)[number]

export interface SaveContentIntent {
  type: 'save_content'
  confidence: number
}

export interface SearchIntent {
  type: 'search'
  confidence: number
  query: string
}

export interface CreateBucketIntent {
  type: 'create_bucket'
  confidence: number
  bucket_name: string
  bucket_type: ParaType
  parent_name: string | null
}

export interface ShowInboxIntent {
  type: 'show_inbox'
  confidence: number
}

export interface MoveNoteIntent {
  type: 'move_note'
  confidence: number
  target_path: string
}

export interface UnknownIntent {
  type: 'unknown'
  confidence: number
}

export type DetectedIntent =
  | SaveContentIntent
  | SearchIntent
  | CreateBucketIntent
  | ShowInboxIntent
  | MoveNoteIntent
  | UnknownIntent
