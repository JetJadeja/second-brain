const PAYWALL_DOMAINS = new Set([
  'wsj.com',
  'ft.com',
  'nytimes.com',
  'bloomberg.com',
  'economist.com',
  'washingtonpost.com',
  'theathletic.com',
  'thetimes.co.uk',
  'hbr.org',
  'barrons.com',
])

const MIN_CONTENT_LENGTH = 200

export function isLikelyPaywall(content: string, domain: string): boolean {
  const cleanDomain = domain.replace('www.', '')

  if (PAYWALL_DOMAINS.has(cleanDomain) && content.length < 500) {
    return true
  }

  if (content.length < MIN_CONTENT_LENGTH) {
    return true
  }

  return false
}
