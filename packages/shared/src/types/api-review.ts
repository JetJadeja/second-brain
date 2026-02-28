export interface ReviewResponse {
  inbox: { count: number; oldest_unprocessed_at: string | null }
  projects: Array<{
    id: string
    name: string
    note_count: number
    last_captured_at: string
    is_stale: boolean
  }>
  areas: Array<{
    name: string
    note_count: number
    last_captured_days: number
  }>
  nudges: Array<{
    id: string
    title: string
    view_count: number
  }>
  recently_added: Array<{
    id: string
    title: string
    source_type: string
    bucket_path: string | null
    captured_at: string
  }>
  largest_buckets: Array<{
    id: string
    name: string
    note_count: number
    type: string
  }>
}
