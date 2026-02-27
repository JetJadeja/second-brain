import { buildSummarizePrompt, callClaude } from '@second-brain/ai'
import type { NoteSource } from '@second-brain/shared'

interface SummarizeParams {
  title: string
  content: string
  sourceType: NoteSource
  userNote?: string | null
}

interface SummarizeResult {
  title: string
  summary: string
}

const MIN_CONTENT_LENGTH = 100

export async function summarizeContent(params: SummarizeParams): Promise<SummarizeResult | null> {
  if (params.content.trim().length < MIN_CONTENT_LENGTH) return null

  try {
    const prompt = buildSummarizePrompt({
      title: params.title,
      content: params.content,
      sourceType: params.sourceType,
      userNote: params.userNote,
    })

    const raw = await callClaude({ messages: [{ role: 'user', content: prompt }] })
    return parseResponse(raw)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[summarizeContent] Failed:', msg)
    return null
  }
}

function parseResponse(raw: string): SummarizeResult | null {
  try {
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned) as Record<string, unknown>

    const title = typeof parsed.title === 'string' ? parsed.title.trim() : ''
    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : ''

    if (!summary) {
      console.warn('[summarizeContent] Empty summary in response')
      return null
    }

    return { title: title || '', summary }
  } catch {
    console.warn('[summarizeContent] Failed to parse JSON, using raw text as summary')
    return { title: '', summary: raw.trim() }
  }
}
