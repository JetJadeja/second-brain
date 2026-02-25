const URL_REGEX = /https?:\/\/[^\s]+/g

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'ref',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
])

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)

    parsed.hostname = parsed.hostname.toLowerCase()

    if (parsed.hostname.startsWith('www.')) {
      parsed.hostname = parsed.hostname.slice(4)
    }

    for (const param of [...parsed.searchParams.keys()]) {
      if (TRACKING_PARAMS.has(param)) {
        parsed.searchParams.delete(param)
      }
    }

    parsed.searchParams.sort()

    let result = parsed.toString()

    if (result.endsWith('/')) {
      result = result.slice(0, -1)
    }

    return result
  } catch {
    return url
  }
}

export function extractUrlsFromText(text: string): string[] {
  const matches = text.match(URL_REGEX)
  if (!matches) return []

  return matches.map(normalizeUrl)
}
