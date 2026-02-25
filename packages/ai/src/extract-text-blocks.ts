import type { AnthropicContentBlock } from './providers/anthropic-tools.js'

/**
 * Extracts text from Anthropic content blocks.
 *
 * mode 'all': collects all text blocks, joins with newline, fallback "Done!"
 * mode 'first': returns the first text block only, empty string fallback
 */
export function extractText(
  content: AnthropicContentBlock[],
  mode: 'all' | 'first' = 'all',
): string {
  if (mode === 'first') {
    for (const block of content) {
      if (block.type === 'text' && block.text.trim()) {
        return block.text
      }
    }
    return ''
  }

  const texts: string[] = []
  for (const block of content) {
    if (block.type === 'text' && block.text.trim()) {
      texts.push(block.text)
    }
  }
  return texts.join('\n') || 'Done!'
}
