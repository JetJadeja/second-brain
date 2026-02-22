import { buildClassifyPrompt, callClaude } from '@second-brain/ai'
import { getAllBuckets, getSampleNoteTitles } from '@second-brain/db'
import { buildParaTree } from '@second-brain/shared'
import type { NoteSource, ClassifyResult, SuggestNewBucket } from '@second-brain/shared'

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
    const [buckets, sampleTitles] = await Promise.all([
      getAllBuckets(params.userId),
      getSampleNoteTitles(params.userId),
    ])
    const paraTree = buildParaTree(buckets)

    const prompt = buildClassifyPrompt({
      paraTree,
      title: params.title,
      content: params.content,
      summary: params.summary,
      sourceType: params.sourceType,
      userNote: params.userNote,
      sampleTitles,
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

    const result: ClassifyResult = {
      bucket_id: String(parsed['bucket_id'] ?? ''),
      confidence: Number(parsed['confidence'] ?? 0),
      tags: Array.isArray(parsed['tags']) ? parsed['tags'] as string[] : [],
      is_original_thought: Boolean(parsed['is_original_thought']),
    }

    const suggestion = parseSuggestNewBucket(parsed['suggest_new_bucket'])
    if (suggestion) {
      result.suggest_new_bucket = suggestion
    }

    return result
  } catch {
    console.error('[classifyContent] Failed to parse response:', text.slice(0, 200))
    return null
  }
}

const VALID_PARENT_TYPES = new Set(['project', 'area', 'resource'])

function parseSuggestNewBucket(raw: unknown): SuggestNewBucket | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const name = typeof obj['name'] === 'string' ? obj['name'].trim() : ''
  const parentType = typeof obj['parent_type'] === 'string' ? obj['parent_type'] : ''

  if (!name || !VALID_PARENT_TYPES.has(parentType)) return null

  return { name, parent_type: parentType as SuggestNewBucket['parent_type'] }
}
