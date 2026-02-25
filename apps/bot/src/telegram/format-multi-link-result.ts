import type { MultiLinkResult } from '../handlers/agent-handler.js'

export function formatMultiLinkResults(results: MultiLinkResult[]): string {
  const successCount = results.filter((r) => !r.error && !r.response?.deduplicated).length
  const dedupCount = results.filter((r) => r.response?.deduplicated).length

  const lines = results.map(formatSingleResult)

  const parts: string[] = []
  if (successCount > 0) parts.push(`captured ${successCount}`)
  if (dedupCount > 0) parts.push(`${dedupCount} already captured`)

  const header = parts.length > 0
    ? `${parts.join(', ')}:`
    : 'processed links:'

  return `${header}\n${lines.join('\n')}`
}

function formatSingleResult(result: MultiLinkResult): string {
  if (result.error) {
    return `→ ${result.url} — couldn't process`
  }

  if (result.response?.deduplicated) {
    return `→ ${result.response.text} — already captured`
  }

  return `→ ${result.response?.text ?? 'captured'}`
}
