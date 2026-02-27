import type { NoteSource } from '@second-brain/shared'
import { extractUrlsFromText, stripUrlsFromText } from '@second-brain/shared'
import type { BotContext } from '../context.js'

export interface DetectedMessage {
  sourceType: NoteSource
  url: string | null
  userNote: string | null
  attachment: {
    type: 'document' | 'photo' | 'voice' | 'video'
    fileId: string
    mimeType?: string
    fileName?: string
  } | null
}

export interface UnsupportedMessage {
  unsupported: true
}

export type DetectionResult = DetectedMessage | DetectedMessage[] | UnsupportedMessage

export function isUnsupported(result: DetectionResult): result is UnsupportedMessage {
  return 'unsupported' in result && result.unsupported === true
}

const UNSUPPORTED_TYPES = ['sticker', 'animation', 'contact', 'location'] as const

export function detectMessageType(ctx: BotContext): DetectionResult {
  const msg = ctx.message

  // 1. Check for unsupported message types
  if (msg && UNSUPPORTED_TYPES.some((t) => t in msg && msg[t as keyof typeof msg])) {
    return { unsupported: true }
  }

  // 2. Check attachments (priority order)
  if (msg?.document) {
    return detectDocument(msg)
  }

  if (msg?.photo && msg.photo.length > 0) {
    return detectPhoto(msg)
  }

  if (msg?.voice) {
    return { sourceType: 'voice_memo', url: null, userNote: null, attachment: { type: 'voice', fileId: msg.voice.file_id } }
  }

  if (msg?.video) {
    return { sourceType: 'video', url: null, userNote: msg.caption ?? null, attachment: { type: 'video', fileId: msg.video.file_id } }
  }

  // 3. Check text for URLs
  const text = msg?.text ?? msg?.caption ?? ''
  const urls = extractUrlsFromText(text)

  if (urls.length > 0) {
    return detectUrls(text, urls)
  }

  // 4. Plain text — original thought
  return { sourceType: 'thought', url: null, userNote: null, attachment: null }
}

function detectDocument(msg: NonNullable<BotContext['message']>): DetectedMessage {
  const doc = msg.document!
  const isPdf = doc.mime_type === 'application/pdf'
  return {
    sourceType: isPdf ? 'pdf' : 'document',
    url: null,
    userNote: msg.caption ?? null,
    attachment: { type: 'document', fileId: doc.file_id, mimeType: doc.mime_type, fileName: doc.file_name },
  }
}

function detectPhoto(msg: NonNullable<BotContext['message']>): DetectedMessage {
  const largest = msg.photo![msg.photo!.length - 1]!
  return {
    sourceType: 'image',
    url: null,
    userNote: msg.caption ?? null,
    attachment: { type: 'photo', fileId: largest.file_id },
  }
}

function detectUrls(text: string, urls: string[]): DetectedMessage | DetectedMessage[] {
  const userNote = stripUrlsFromText(text) || null
  const messages = urls.map((url): DetectedMessage => ({
    sourceType: 'article',
    url,
    userNote,
    attachment: null,
  }))
  return messages.length === 1 ? messages[0]! : messages
}
