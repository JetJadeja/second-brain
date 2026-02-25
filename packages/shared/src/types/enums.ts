export const PARA_TYPES = ['project', 'area', 'resource', 'archive'] as const
export type ParaType = (typeof PARA_TYPES)[number]

export const NOTE_SOURCES = [
  'article', 'tweet', 'thread', 'reel', 'image',
  'pdf', 'voice_memo', 'thought', 'youtube', 'video', 'document', 'other',
] as const
export type NoteSource = (typeof NOTE_SOURCES)[number]

export const DISTILLATION_STATUSES = ['raw', 'key_points', 'distilled', 'evergreen'] as const
export type DistillationStatus = (typeof DISTILLATION_STATUSES)[number]

export const CONNECTION_TYPES = ['explicit', 'ai_detected'] as const
export type ConnectionType = (typeof CONNECTION_TYPES)[number]

export const SUGGESTION_TYPES = [
  'split_bucket', 'merge_notes', 'archive_project',
  'reclassify_note', 'create_sub_bucket', 'link_notes',
  'create_bucket', 'merge_buckets', 'rename_bucket', 'delete_bucket',
] as const
export type SuggestionType = (typeof SUGGESTION_TYPES)[number]

export const SUGGESTION_STATUSES = ['pending', 'accepted', 'dismissed'] as const
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number]
