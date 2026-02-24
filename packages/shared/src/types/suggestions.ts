export interface SplitBucketPayload {
  bucket_id: string
  bucket_name: string
  splits: Array<{ name: string; note_ids: string[] }>
}

export interface ReclassifyNotePayload {
  note_id: string
  note_title: string
  from_bucket_id: string
  from_path: string
  to_bucket_id: string
  to_path: string
  reason: string
}

export interface ArchiveProjectPayload {
  bucket_id: string
  bucket_name: string
  days_inactive: number
}

export interface CreateSubBucketPayload {
  parent_bucket_id: string
  parent_name: string
  new_name: string
  note_ids: string[]
}

export interface CreateBucketPayload {
  note_id: string
  note_title: string
  bucket_name: string
  parent_type: 'project' | 'area' | 'resource'
}

export type SuggestionPayload =
  | SplitBucketPayload
  | ReclassifyNotePayload
  | ArchiveProjectPayload
  | CreateSubBucketPayload
  | CreateBucketPayload
