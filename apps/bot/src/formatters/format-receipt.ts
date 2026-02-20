import type { ProcessedNote } from '../processors/process-note.js'

export function formatReceipt(result: ProcessedNote, bucketPath: string | null): string {
  const lines: string[] = []

  // Header
  lines.push('📥 Saved to Inbox')
  lines.push('')

  // Title
  lines.push(`"${result.note.title}"`)
  lines.push('')

  // Warning from extraction
  if (result.warning) {
    lines.push(`⚠️ ${result.warning}`)
    lines.push('')
  }

  // Summary
  if (result.summary) {
    lines.push(`Summary: ${result.summary}`)
  } else if (result.note.original_content) {
    const snippet = result.note.original_content.slice(0, 150)
    lines.push(`Summary: ${snippet}...`)
  }
  lines.push('')

  // Suggested bucket
  if (bucketPath && result.classification?.confidence && result.classification.confidence >= 0.4) {
    lines.push(`Suggested: ${bucketPath}`)
  } else {
    lines.push("I'm not sure where this belongs.")
  }

  // Tags
  const tags = result.classification?.tags ?? []
  if (tags.length > 0) {
    lines.push(`Tags: ${tags.map((t) => `#${t}`).join(' ')}`)
  }

  lines.push('')
  lines.push('React with 👍 to confirm placement, or reply to adjust.')

  return lines.join('\n')
}
