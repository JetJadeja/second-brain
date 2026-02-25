import type { ExtractedContent, ImageSource } from '@second-brain/shared'
import { extractArticle } from './extract-article.js'
import { extractTweet } from './extract-tweet.js'
import { extractYoutube } from './extract-youtube.js'
import { extractReel } from './extract-reel.js'
import { describeImages } from './describe-images.js'

export interface ExtractionToolResult {
  text: string
  extracted: ExtractedContent
  warning?: string
}

export async function executeExtractionTool(
  toolName: string,
  input: Record<string, unknown>,
): Promise<ExtractionToolResult> {
  if (toolName === 'describe_images') {
    return handleDescribeImages(input)
  }

  const url = String(input['url'] ?? '')
  if (!url) {
    throw new Error('Missing url parameter')
  }

  switch (toolName) {
    case 'fetch_url':
      return handleFetchUrl(url)
    case 'fetch_tweet':
      return handleFetchTweet(url)
    case 'fetch_video_metadata':
      return handleFetchVideo(url)
    default:
      throw new Error(`Unknown extraction tool: ${toolName}`)
  }
}

async function handleFetchUrl(url: string): Promise<ExtractionToolResult> {
  const result = await extractArticle(url)
  const { content } = result
  const text = formatForLlm(content, result.warning)
  return { text, extracted: content, warning: result.warning }
}

async function handleFetchTweet(url: string): Promise<ExtractionToolResult> {
  const result = await extractTweet(url)
  const { content } = result
  const text = formatForLlm(content, result.warning)
  return { text, extracted: content, warning: result.warning }
}

async function handleFetchVideo(url: string): Promise<ExtractionToolResult> {
  const isInstagram = url.includes('instagram.com')
  const result = isInstagram
    ? await extractReel(url)
    : await extractYoutube(url)
  const { content } = result
  const text = formatForLlm(content, result.warning)
  return { text, extracted: content, warning: result.warning }
}

async function handleDescribeImages(
  input: Record<string, unknown>,
): Promise<ExtractionToolResult> {
  const raw = input['urls']
  const urls = Array.isArray(raw) ? raw.filter((u): u is string => typeof u === 'string') : []

  if (urls.length === 0) {
    throw new Error('Missing or empty urls parameter')
  }

  const descriptions = await describeImages(urls)
  const text = descriptions
    .map((desc, i) => `Image ${i + 1}: ${desc}`)
    .join('\n\n')

  const extracted: ExtractedContent = {
    title: 'Image descriptions',
    content: text,
    sourceType: 'image',
    source: {} as ImageSource,
  }

  return { text, extracted }
}

function formatForLlm(content: ExtractedContent, warning?: string): string {
  const parts: string[] = []

  parts.push(`Title: ${content.title}`)
  parts.push(`Source type: ${content.sourceType}`)

  if (content.content) {
    const preview = content.content.length > 4000
      ? content.content.slice(0, 4000) + '\n...[truncated]'
      : content.content
    parts.push(`Content (${content.content.length} chars):\n${preview}`)
  } else {
    parts.push('Content: [empty — extraction returned no text]')
  }

  if (warning) {
    parts.push(`Warning: ${warning}`)
  }

  return parts.join('\n\n')
}
