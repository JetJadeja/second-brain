export type ParaType = 'project' | 'area' | 'resource' | 'archive'
export type NoteSource = 'article' | 'tweet' | 'reel' | 'pdf' | 'voice_memo' | 'thought' | 'document'
export type DistillationStatus = 'raw' | 'key_points' | 'distilled' | 'evergreen'

export interface ParaBucket {
  id: string
  name: string
  type: ParaType
  noteCount: number
  lastCaptureDate: string
}

export interface Note {
  id: string
  title: string
  excerpt: string
  sourceType: NoteSource
  distillationStatus: DistillationStatus
  bucketId: string
  bucketName: string
  bucketType: ParaType
  capturedAt: string
  connectionCount: number
  sourceDomain?: string
}

export interface InboxItem {
  id: string
  title: string
  summary: string
  sourceType: NoteSource
  suggestedBucket: string
  capturedAt: string
}
