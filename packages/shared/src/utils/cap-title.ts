/**
 * Truncates a title at the last word boundary within maxLen.
 * Adds "..." if truncated.
 */
export function capTitle(raw: string, maxLen = 80): string {
  const trimmed = raw.trim()
  if (trimmed.length <= maxLen) return trimmed

  const truncated = trimmed.slice(0, maxLen - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  const cutPoint = lastSpace > maxLen * 0.5 ? lastSpace : maxLen - 3
  return trimmed.slice(0, cutPoint) + '...'
}

/**
 * Cleans an article title by stripping common site name suffixes,
 * then caps the length.
 */
export function cleanArticleTitle(raw: string, maxLen = 80): string {
  let title = raw.trim()

  // Strip common site name patterns at end of title
  title = title.replace(/\s*[|\u2013\u2014-]\s*[^|\u2013\u2014-]{1,40}$/, '')

  return capTitle(title, maxLen)
}
