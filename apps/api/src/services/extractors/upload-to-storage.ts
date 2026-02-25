import { getServiceClient } from '@second-brain/db'

const BUCKET = 'user-content'

/**
 * Uploads a file buffer to Supabase Storage.
 * Returns the storage path.
 */
export async function uploadToStorage(
  userId: string,
  noteId: string,
  fileName: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const path = `${userId}/${noteId}/${fileName}`
  const supabase = getServiceClient()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true })

  if (error) {
    console.error('Storage upload failed:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }

  return path
}
