import { getNoteById, updateNote, getAllBuckets } from '@second-brain/db'
import type { ParaBucket } from '@second-brain/shared'
import { getBucketPath } from '../../handlers/resolve-bucket-path.js'

export interface MoveNoteResult {
  noteTitle: string
  targetPath: string | null
}

export async function executeMoveNote(
  userId: string,
  noteId: string,
  targetPath: string,
): Promise<MoveNoteResult> {
  const note = await getNoteById(userId, noteId)
  if (!note) {
    throw new Error(`Could not find note with ID ${noteId}`)
  }

  const buckets = await getAllBuckets(userId)
  const targetBucket = findTargetBucket(buckets, targetPath)

  if (!targetBucket) {
    throw new Error(`Could not find a folder matching "${targetPath}"`)
  }

  await updateNote(userId, noteId, {
    bucket_id: targetBucket.id,
    is_classified: true,
  } as Record<string, unknown>)

  const resolvedPath = await getBucketPath(userId, targetBucket.id)
  return { noteTitle: note.title, targetPath: resolvedPath }
}

function findTargetBucket(buckets: ParaBucket[], target: string): ParaBucket | null {
  const lower = target.toLowerCase().trim()

  const exactMatch = buckets.find((b) => b.name.toLowerCase() === lower)
  if (exactMatch) return exactMatch

  const segments = lower.split(/\s*>\s*/).map((s) => s.trim())
  const lastName = segments[segments.length - 1]
  if (!lastName) return null

  const nameMatches = buckets.filter((b) => b.name.toLowerCase() === lastName)
  if (nameMatches.length === 1) return nameMatches[0]!

  for (const candidate of nameMatches) {
    if (matchesPathSegments(buckets, candidate, segments)) return candidate
  }

  return nameMatches[0] ?? null
}

function matchesPathSegments(
  buckets: ParaBucket[],
  bucket: ParaBucket,
  segments: string[],
): boolean {
  let current: ParaBucket | undefined = bucket
  for (let i = segments.length - 1; i >= 0; i--) {
    if (!current || current.name.toLowerCase() !== segments[i]) return false
    current = current.parent_id
      ? buckets.find((b) => b.id === current!.parent_id)
      : undefined
  }
  return true
}
