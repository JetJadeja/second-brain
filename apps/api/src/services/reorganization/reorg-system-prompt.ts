interface BucketSnapshot {
  id: string
  name: string
  type: string
  parent_id: string | null
  note_count: number
  sample_titles: string[]
  last_capture_at: string | null
}

export function buildReorgSystemPrompt(buckets: BucketSnapshot[]): string {
  return IDENTITY + formatTreeSnapshot(buckets) + INSTRUCTIONS + OUTPUT_FORMAT
}

const IDENTITY =
  `You are a knowledge base reorganization assistant. You analyze the user's ` +
  `folder structure and suggest improvements to keep it clean and navigable.\n\n`

function formatTreeSnapshot(buckets: BucketSnapshot[]): string {
  if (buckets.length === 0) return 'FOLDER STRUCTURE: (empty)\n\n'

  const lines = buckets.map((b) => {
    const depth = b.parent_id ? 1 : 0
    const indent = '  '.repeat(depth)
    const notes = b.note_count > 0 ? ` (${b.note_count} notes)` : ' (empty)'
    const titles = b.sample_titles.length > 0
      ? ` — recent: ${b.sample_titles.join(', ')}`
      : ''
    return `${indent}- ${b.name} [${b.type}]${notes}${titles}`
  })

  return `FOLDER STRUCTURE:\n${lines.join('\n')}\n\n`
}

const INSTRUCTIONS =
  `ANALYZE the folder structure for:\n` +
  `1. Overlapping or similar bucket names that should be merged\n` +
  `2. Buckets with names that don't match their contents (suggest rename)\n` +
  `3. Empty buckets that have been around with no notes (suggest delete)\n` +
  `4. Bloated buckets with 15+ notes that could be split into sub-topics\n` +
  `5. Misplaced notes that belong in a different bucket (suggest reclassify)\n` +
  `6. Stale projects inactive for 30+ days (suggest archive)\n\n` +
  `Use tools to inspect specific buckets when you need more detail.\n` +
  `Only suggest changes you are confident about. Quality over quantity.\n` +
  `If the structure looks healthy, say so and suggest nothing.\n\n`

const OUTPUT_FORMAT =
  `When done analyzing, output your suggestions as a JSON array:\n` +
  `[{ "type": "merge_buckets", "payload": { ... } }, ...]\n\n` +
  `Suggestion types and required payload fields:\n` +
  `- merge_buckets: { source_bucket_id, source_name, target_bucket_id, target_name, reason }\n` +
  `- rename_bucket: { bucket_id, old_name, new_name, reason }\n` +
  `- delete_bucket: { bucket_id, bucket_name, reason }\n` +
  `- split_bucket: { bucket_id, bucket_name, splits: [{ name, note_ids }] }\n` +
  `- archive_project: { bucket_id, bucket_name, days_inactive }\n` +
  `- reclassify_note: { note_id, note_title, from_bucket_id, from_path, to_bucket_id, to_path, reason }\n\n` +
  `Output ONLY the JSON array. No markdown fences, no explanation before or after.\n` +
  `If no suggestions, output: []\n`
