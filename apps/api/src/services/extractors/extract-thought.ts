import type { ExtractedContent, ThoughtSource } from '@second-brain/shared'

/**
 * "Extract" plain text as an original thought.
 * Title is a truncated first line — AI will generate a better one later.
 */
export function extractThought(text: string): ExtractedContent {
  const firstLine = text.split('\n')[0] ?? text
  const title = firstLine.length > 80
    ? firstLine.slice(0, 77) + '...'
    : firstLine

  return {
    title,
    content: text,
    sourceType: 'thought',
    source: {} as ThoughtSource,
  }
}
