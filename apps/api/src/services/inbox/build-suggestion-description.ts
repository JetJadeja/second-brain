import type { SuggestionType } from '@second-brain/shared'

export function buildSuggestionDescription(
  type: SuggestionType,
  payload: Record<string, unknown>,
): string {
  switch (type) {
    case 'create_bucket':
      return `Create a new bucket "${s(payload, 'bucket_name')}" under ${s(payload, 'parent_type')} and file "${s(payload, 'note_title')}" there.`

    case 'split_bucket': {
      const splits = payload['splits']
      const names = Array.isArray(splits)
        ? (splits as Array<Record<string, unknown>>).map((s) => `"${s['name']}"`).join(', ')
        : 'sub-buckets'
      return `"${s(payload, 'bucket_name')}" has grown large. Split into ${names}.`
    }

    case 'archive_project':
      return `"${s(payload, 'bucket_name')}" has been inactive for ${payload['days_inactive'] ?? '?'} days. Archive it?`

    case 'reclassify_note':
      return `Move "${s(payload, 'note_title')}" from ${s(payload, 'from_path')} to ${s(payload, 'to_path')}.`

    case 'create_sub_bucket': {
      const noteIds = payload['note_ids']
      const count = Array.isArray(noteIds) ? noteIds.length : 0
      return `Create sub-bucket "${s(payload, 'new_name')}" under "${s(payload, 'parent_name')}" and move ${count} notes.`
    }

    default:
      return `Suggestion: ${type}`
  }
}

function s(payload: Record<string, unknown>, key: string): string {
  return typeof payload[key] === 'string' ? (payload[key] as string) : ''
}
