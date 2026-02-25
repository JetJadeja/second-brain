export type NoteSource =
  | 'article'
  | 'tweet'
  | 'thread'
  | 'reel'
  | 'image'
  | 'pdf'
  | 'voice_memo'
  | 'thought'
  | 'youtube'
  | 'document'
  | 'other'

export type DistillationStatus = 'raw' | 'key_points' | 'distilled' | 'evergreen'

export type ParaType = 'project' | 'area' | 'resource' | 'archive'

export const DISTILLATION_LABELS: Record<DistillationStatus, string> = {
  raw: 'Raw',
  key_points: 'Key Points',
  distilled: 'Distilled',
  evergreen: 'Evergreen',
}

export const SOURCE_LABELS: Record<NoteSource, string> = {
  article: 'Article',
  tweet: 'Tweet',
  thread: 'Thread',
  reel: 'Reel',
  image: 'Image',
  pdf: 'PDF',
  voice_memo: 'Voice Memo',
  thought: 'Thought',
  youtube: 'YouTube',
  document: 'Document',
  other: 'Other',
}

export const PARA_LABELS: Record<ParaType, string> = {
  project: 'Project',
  area: 'Area',
  resource: 'Resource',
  archive: 'Archive',
}
