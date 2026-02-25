export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  HOME: '/home',
  INBOX: '/inbox',
  BUCKET: '/buckets/:bucketId',
  NOTE: '/notes/:noteId',
  GRAPH: '/graph',
  REVIEW: '/review',
  SETTINGS: '/settings',
} as const

export function bucketRoute(bucketId: string): string {
  return `/buckets/${bucketId}`
}

export function noteRoute(noteId: string): string {
  return `/notes/${noteId}`
}
