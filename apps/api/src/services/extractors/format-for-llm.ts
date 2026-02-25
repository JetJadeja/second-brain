import type { ExtractedContent } from '@second-brain/shared'

/**
 * Formats extracted content as readable text for the LLM agent.
 * Includes title, source type, content preview (capped at 4000 chars), and any warnings.
 */
export function formatForLlm(content: ExtractedContent, warning?: string): string {
  const parts: string[] = []

  parts.push(`Title: ${content.title}`)
  parts.push(`Source type: ${content.sourceType}`)

  if (content.content) {
    const preview = content.content.length > 4000
      ? content.content.slice(0, 4000) + '\n...[truncated]'
      : content.content
    parts.push(`Content (${content.content.length} chars):\n${preview}`)
  } else {
    parts.push('Content: [empty — extraction returned no text]')
  }

  if (warning) {
    parts.push(`Warning: ${warning}`)
  }

  return parts.join('\n\n')
}
