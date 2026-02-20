import { buildSummarizePrompt, callClaude } from '@second-brain/ai'
import type { NoteSource } from '@second-brain/shared'

interface SummarizeParams {
  title: string
  content: string
  sourceType: NoteSource
  userNote?: string | null
}

export async function summarizeContent(params: SummarizeParams): Promise<string | null> {
  if (!params.content.trim()) return null

  try {
    const prompt = buildSummarizePrompt({
      title: params.title,
      content: params.content,
      sourceType: params.sourceType,
      userNote: params.userNote,
    })

    return await callClaude({ messages: [{ role: 'user', content: prompt }] })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[summarizeContent] Failed:', msg)
    return null
  }
}
