import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'
import type { ExtractedContent, ArticleSource } from '@second-brain/shared'
import { fetchHtml } from './fetch-html.js'
import { isLikelyPaywall } from './detect-paywall.js'

export interface ExtractionResult {
  content: ExtractedContent
  warning?: string
}

export async function extractArticle(url: string): Promise<ExtractionResult> {
  const domain = getDomain(url)
  const fallback = buildFallback(url, domain)

  let html: string
  let statusCode: number

  try {
    const result = await fetchHtml(url)
    html = result.html
    statusCode = result.statusCode
  } catch (error: unknown) {
    if (isAbortError(error)) {
      return { content: fallback, warning: 'The page took too long to load. Saved the URL.' }
    }
    return { content: fallback, warning: "Couldn't load this page. Saved the URL." }
  }

  if (statusCode === 404) {
    return { content: fallback, warning: 'This link appears broken (404). Saved the URL anyway.' }
  }

  if (statusCode >= 400) {
    return { content: fallback, warning: "Couldn't load this page. Saved the URL." }
  }

  const doc = new JSDOM(html, { url })
  const article = new Readability(doc.window.document).parse()

  if (!article || !article.textContent?.trim()) {
    return {
      content: fallback,
      warning: "Couldn't extract content from this page. Saved the URL.",
    }
  }

  const textContent = article.textContent.trim()

  const title = article.title ? cleanTitle(article.title) : domain

  if (isLikelyPaywall(textContent, domain)) {
    const source: ArticleSource = { url, domain, author: article.byline ?? undefined }
    return {
      content: {
        title,
        content: textContent,
        sourceType: 'article',
        source,
      },
      warning: 'This might be behind a paywall. Saved what I could.',
    }
  }

  const source: ArticleSource = {
    url,
    domain,
    author: article.byline ?? undefined,
  }

  return {
    content: {
      title,
      content: textContent,
      sourceType: 'article',
      source,
    },
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return 'unknown'
  }
}

function buildFallback(url: string, domain: string): ExtractedContent {
  return {
    title: domain,
    content: '',
    sourceType: 'article',
    source: { url, domain } as ArticleSource,
  }
}

/** Strip common site name suffixes from HTML <title> tags (e.g., "— Medium", "| Blog"). */
function cleanTitle(title: string): string {
  return title.replace(/\s*[—|•\-]\s+\S+(\s+\S+){0,2}\s*$/, '').trim()
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}
