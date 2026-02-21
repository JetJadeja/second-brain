import { buildDetectIntentPrompt, callClaude } from '@second-brain/ai'
import { getAllBuckets } from '@second-brain/db'
import { buildParaTree } from '@second-brain/shared'
import type { DetectedIntent } from '@second-brain/shared'

const FALLBACK_INTENT: DetectedIntent = { type: 'save_content', confidence: 0 }

interface DetectIntentParams {
  userId: string
  messageText: string
  hasAttachment: boolean
  hasUrl: boolean
}

export async function detectIntent(params: DetectIntentParams): Promise<DetectedIntent> {
  try {
    const buckets = await getAllBuckets(params.userId)
    const paraTree = buildParaTree(buckets)

    const prompt = buildDetectIntentPrompt({
      messageText: params.messageText,
      paraTree,
      hasAttachment: params.hasAttachment,
      hasUrl: params.hasUrl,
    })

    const response = await callClaude({
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 256,
    })

    return parseIntentResponse(response)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[detectIntent] Failed:', msg)
    return FALLBACK_INTENT
  }
}

function parseIntentResponse(text: string): DetectedIntent {
  try {
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned) as Record<string, unknown>
    const intent = String(parsed['intent'] ?? 'save_content')
    const confidence = Number(parsed['confidence'] ?? 0)

    switch (intent) {
      case 'search':
        return { type: 'search', confidence, query: String(parsed['query'] ?? '') }

      case 'create_bucket':
        return {
          type: 'create_bucket',
          confidence,
          bucket_name: String(parsed['bucket_name'] ?? ''),
          bucket_type: parseBucketType(parsed['bucket_type']),
          parent_name: parsed['parent_name'] ? String(parsed['parent_name']) : null,
        }

      case 'show_inbox':
        return { type: 'show_inbox', confidence }

      case 'move_note':
        return {
          type: 'move_note',
          confidence,
          target_path: String(parsed['target_path'] ?? ''),
          note_refs: parseNoteRefs(parsed['note_refs']),
        }

      case 'save_content':
        return { type: 'save_content', confidence }

      default:
        return { type: 'unknown', confidence }
    }
  } catch {
    console.error('[detectIntent] Failed to parse response:', text.slice(0, 200))
    return FALLBACK_INTENT
  }
}

function parseBucketType(value: unknown): 'project' | 'area' | 'resource' {
  const str = String(value ?? '').toLowerCase()
  if (str === 'project' || str === 'area' || str === 'resource') return str
  return 'project'
}

function parseNoteRefs(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.length > 0)
}
