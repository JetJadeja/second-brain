/**
 * Extracts and parses JSON from LLM output.
 * Handles markdown code fences and preamble text before JSON.
 * Returns null if no valid JSON is found.
 */
export function parseLlmJson<T = Record<string, unknown>>(text: string): T | null {
  // Try 1: strip markdown fences and parse directly
  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch { /* continue to fallback */ }

  // Try 2: extract JSON object from text with preamble
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(text.slice(start, end + 1)) as T
    } catch { /* give up */ }
  }

  return null
}
