const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const STORAGE_BUCKET = 'user-content'

export function getStorageUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`
}
