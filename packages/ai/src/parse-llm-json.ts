/**
 * Strips markdown code fences from LLM output and parses the JSON.
 * Returns null if parsing fails.
 */
export function parseLlmJson<T = Record<string, unknown>>(text: string): T | null {
  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned) as T
  } catch {
    return null
  }
}
