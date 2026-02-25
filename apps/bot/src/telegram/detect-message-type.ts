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

export type DetectionResult = DetectedMessage | DetectedMessage[]

export function detectMessageType(ctx: BotContext): DetectionResult {
  const msg = ctx.message

  // 1. Check attachments (priority order)
  if (msg?.document) {
    const isPdf = msg.document.mime_type === 'application/pdf'
    return {
      sourceType: isPdf ? 'pdf' : 'document',
      url: null,
      userNote: msg.caption ?? null,
      attachment: {
        type: 'document',
        fileId: msg.document.file_id,
        mimeType: msg.document.mime_type,
        fileName: msg.document.file_name,
      },
    }
  }

  if (msg?.photo && msg.photo.length > 0) {
    const largest = msg.photo[msg.photo.length - 1]!
    return {
      sourceType: 'image',
      url: null,
      userNote: msg.caption ?? null,
      attachment: { type: 'photo', fileId: largest.file_id },
    }
  }

  if (msg?.voice) {
    return {
      sourceType: 'voice_memo',
      url: null,
      userNote: null,
      attachment: { type: 'voice', fileId: msg.voice.file_id },
    }
  }

  if (msg?.video) {
    return {
      sourceType: 'youtube', // placeholder — Phase E handles video properly
      url: null,
      userNote: msg.caption ?? null,
      attachment: { type: 'video', fileId: msg.video.file_id },
    }
  }

  // 2. Check text for URLs
  const text = msg?.text ?? msg?.caption ?? ''
  const urls = extractUrlsFromText(text)

  if (urls.length > 0) {
    const userNote = stripUrlsFromText(text) || null
    const messages = urls.map((url): DetectedMessage => ({
      sourceType: 'article',
      url,
      userNote,
      attachment: null,
    }))
    return messages.length === 1 ? messages[0]! : messages
  }

  // 3. Plain text — original thought
  return {
    sourceType: 'thought',
    url: null,
    userNote: null,
    attachment: null,
  }
}
