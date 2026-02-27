import type { ChatRequest, ExtractedContent } from '@second-brain/shared'
import type { BotContext } from '../context.js'
import { detectMessageType, isUnsupported, type DetectedMessage } from './detect-message-type.js'
import { downloadTelegramFile } from './download-file.js'
import { extractPdf } from '../extractors/extract-pdf.js'
import { extractVoice } from '../extractors/extract-voice.js'
import { extractImage } from '../extractors/extract-image.js'
import { extractVideo } from '../extractors/extract-video.js'
import { uploadToStorage } from '../extractors/upload-to-storage.js'
import { randomUUID } from 'node:crypto'

interface BuildOptions {
  noteContext?: string
  startOnboarding?: boolean
}

/**
 * Translates a Telegram message into a ChatRequest.
 * Downloads and pre-extracts binary attachments (pdf, voice, image)
 * that can't be fetched by the API.
 */
export async function buildChatRequest(
  ctx: BotContext,
  options?: BuildOptions,
): Promise<ChatRequest> {
  const userId = ctx.userId!
  const detectionResult = detectMessageType(ctx)
  if (isUnsupported(detectionResult)) {
    throw new Error('buildChatRequest called with unsupported message type')
  }
  const detected: DetectedMessage = Array.isArray(detectionResult) ? detectionResult[0]! : detectionResult
  const message = buildMessageText(ctx)

  let preExtracted: ExtractedContent | undefined
  let attachmentDescription: string | undefined

  if (detected.attachment) {
    const result = await preExtractBinary(ctx, userId, detected)
    if (result) {
      preExtracted = result.extracted
      attachmentDescription = result.description
    }
  }

  return {
    userId,
    message,
    preExtracted,
    noteContext: options?.noteContext,
    startOnboarding: options?.startOnboarding,
    attachmentDescription,
    platform: 'Telegram',
  }
}

function buildMessageText(ctx: BotContext): string {
  const msg = ctx.message
  if (!msg) return '[empty message]'

  const text = msg.text ?? msg.caption ?? ''
  const parts: string[] = []

  if (msg.photo?.length) parts.push('[User sent a photo]')
  if (msg.voice) parts.push('[User sent a voice memo]')
  if (msg.document) {
    const name = msg.document.file_name ?? 'document'
    parts.push(`[User sent a file: ${name}]`)
  }
  if (msg.video) parts.push('[User sent a video]')
  if (text.trim()) parts.push(text)

  return parts.join('\n') || '[sent a message]'
}

interface PreExtractResult {
  extracted: ExtractedContent
  description: string
}

async function preExtractBinary(
  ctx: BotContext,
  userId: string,
  detected: DetectedMessage,
): Promise<PreExtractResult | null> {
  if (!detected.attachment) return null

  const { buffer } = await downloadTelegramFile(ctx, detected.attachment.fileId)
  const noteId = randomUUID()

  let extracted: ExtractedContent
  let warning: string | undefined

  if (detected.sourceType === 'pdf') {
    const fileName = detected.attachment.fileName ?? 'document.pdf'
    const storagePath = await uploadToStorage(userId, noteId, fileName, buffer, 'application/pdf')
    const result = await extractPdf(buffer, fileName, storagePath)
    extracted = result.content
    warning = result.warning
  } else if (detected.sourceType === 'voice_memo') {
    const storagePath = await uploadToStorage(userId, noteId, 'voice.ogg', buffer, 'audio/ogg')
    const duration = ctx.message?.voice?.duration
    const result = await extractVoice(buffer, storagePath, duration)
    extracted = result.content
    warning = result.warning
  } else if (detected.sourceType === 'image') {
    const mimeType = detected.attachment.mimeType ?? 'image/jpeg'
    const storagePath = await uploadToStorage(userId, noteId, 'image.jpg', buffer, mimeType)
    const result = await extractImage(buffer, storagePath, mimeType)
    extracted = result.content
    warning = result.warning
  } else if (detected.sourceType === 'video') {
    const storagePath = await uploadToStorage(userId, noteId, 'video.mp4', buffer, 'video/mp4')
    const duration = ctx.message?.video?.duration
    const result = await extractVideo(buffer, storagePath, duration)
    extracted = result.content
    warning = result.warning
  } else {
    return null
  }

  const description = buildDescription(extracted, detected.userNote, warning)
  return { extracted, description }
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
  if (userNote) parts.push(`User's caption: ${userNote}`)
  if (warning) parts.push(`Warning: ${warning}`)

  return parts.join('\n')
}
