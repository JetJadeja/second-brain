const TIMEOUT_MS = 10_000

export interface FetchResult {
  html: string
  statusCode: number
}

export async function fetchHtml(url: string): Promise<FetchResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SecondBrainBot/1.0)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    })

    const html = await response.text()
    return { html, statusCode: response.status }
  } finally {
    clearTimeout(timeout)
  }
}
