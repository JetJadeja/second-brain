import { buildClassifyPrompt, callClaude } from '@second-brain/ai'
import { getAllBuckets } from '@second-brain/db'
import { buildParaTree } from '@second-brain/shared'
import type { NoteSource, ClassifyResult } from '@second-brain/shared'

interface ClassifyParams {
  userId: string
  title: string
  content: string
  summary: string | null
  sourceType: NoteSource
  userNote?: string | null
}

export async function classifyContent(params: ClassifyParams): Promise<ClassifyResult | null> {
  try {
    const buckets = await getAllBuckets(params.userId)
    const paraTree = buildParaTree(buckets)

    const prompt = buildClassifyPrompt({
      paraTree,
      title: params.title,
      content: params.content,
      summary: params.summary,
      sourceType: params.sourceType,
      userNote: params.userNote,
    })

    const response = await callClaude({ messages: [{ role: 'user', content: prompt }] })
    return parseClassifyResponse(response)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[classifyContent] Failed:', msg)
    return null
  }
}

function parseClassifyResponse(text: string): ClassifyResult | null {
  try {
    // Strip markdown code fences if present
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned) as Record<string, unknown>

    return {
      bucket_id: String(parsed['bucket_id'] ?? ''),
      confidence: Number(parsed['confidence'] ?? 0),
      tags: Array.isArray(parsed['tags']) ? parsed['tags'] as string[] : [],
      is_original_thought: Boolean(parsed['is_original_thought']),
    }
  } catch {
    console.error('[classifyContent] Failed to parse response:', text.slice(0, 200))
    return null
  }
}
