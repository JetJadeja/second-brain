import type { ExtractedContent } from '@second-brain/shared'
import type { BotContext } from '../context.js'
import { detectMessageType } from '../handlers/detect-message-type.js'
import { extractByType } from '../intent/handlers/extract-content.js'

export interface PreExtractionResult {
  extracted: ExtractedContent
  description: string
  warning?: string
}

export function hasAttachment(ctx: BotContext): boolean {
  const msg = ctx.message
  if (!msg) return false
  return !!(msg.photo?.length || msg.voice || msg.document || msg.video)
}

export async function preExtractAttachment(
  ctx: BotContext,
  userId: string,
): Promise<PreExtractionResult | null> {
  if (!hasAttachment(ctx)) return null

  const detected = detectMessageType(ctx)
  const { content: extracted, warning } = await extractByType(ctx, userId, detected)

  const description = buildDescription(extracted, detected.userNote, warning)
  return { extracted, description, warning }
}

function buildDescription(
  extracted: ExtractedContent,
  userNote: string | null,
  warning?: string,
): string {
  const parts: string[] = []
  parts.push(`[Attachment extracted: "${extracted.title}" (${extracted.sourceType})]`)

  if (extracted.content) {
    const preview = extracted.content.slice(0, 200)
    parts.push(`Content preview: ${preview}${extracted.content.length > 200 ? '...' : ''}`)
  }

  if (userNote) {
    parts.push(`User's caption: ${userNote}`)
  }

  if (warning) {
    parts.push(`Warning: ${warning}`)
  }

  return parts.join('\n')
}
