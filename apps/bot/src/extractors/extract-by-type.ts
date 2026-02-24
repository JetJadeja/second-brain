import type { BotContext } from '../context.js'
import type { ExtractedContent } from '@second-brain/shared'
import type { DetectedMessage } from '../handlers/detect-message-type.js'
import { extractArticle } from './extract-article.js'
import { extractThought } from './extract-thought.js'
import { extractTweet } from './extract-tweet.js'
import { extractReel } from './extract-reel.js'
import { extractYoutube } from './extract-youtube.js'
import { extractPdf } from './extract-pdf.js'
import { extractVoice } from './extract-voice.js'
import { extractImage } from './extract-image.js'
import { downloadTelegramFile } from './download-telegram-file.js'
import { uploadToStorage } from './upload-to-storage.js'
import { randomUUID } from 'node:crypto'

interface ExtractionResult {
  content: ExtractedContent
  warning?: string
}

export async function extractByType(
  ctx: BotContext,
  userId: string,
  detected: DetectedMessage,
): Promise<ExtractionResult> {
  const text = ctx.message?.text ?? ctx.message?.caption ?? ''

  if (detected.sourceType === 'article' && detected.url) {
    const result = await extractArticle(detected.url)
    return { content: result.content, warning: result.warning }
  }

  if ((detected.sourceType === 'tweet' || detected.sourceType === 'thread') && detected.url) {
    const result = await extractTweet(detected.url)
    return { content: result.content, warning: result.warning }
  }

  if (detected.sourceType === 'reel' && detected.url) {
    const result = await extractReel(detected.url)
    return { content: result.content, warning: result.warning }
  }

  if (detected.sourceType === 'youtube' && detected.url) {
    const result = await extractYoutube(detected.url)
    return { content: result.content, warning: result.warning }
  }

  if (detected.sourceType === 'pdf' && detected.attachment) {
    return extractPdfContent(ctx, userId, detected)
  }

  if (detected.sourceType === 'voice_memo' && detected.attachment) {
    return extractVoiceContent(ctx, userId, detected)
  }

  if (detected.sourceType === 'image' && detected.attachment) {
    return extractImageContent(ctx, userId, detected)
  }

  if (detected.sourceType === 'thought') {
    return { content: extractThought(text) }
  }

  // Fallback: save URL/text as-is
  const content = extractThought(detected.url ?? text)
  content.sourceType = detected.sourceType
  if (detected.url) {
    content.source = { url: detected.url } as unknown as typeof content.source
  }
  return { content }
}

async function extractPdfContent(
  ctx: BotContext,
  userId: string,
  detected: DetectedMessage,
): Promise<ExtractionResult> {
  const { buffer } = await downloadTelegramFile(ctx, detected.attachment!.fileId)
  const fileName = detected.attachment!.fileName ?? 'document.pdf'
  const noteId = randomUUID()
  const storagePath = await uploadToStorage(userId, noteId, fileName, buffer, 'application/pdf')
  const result = await extractPdf(buffer, fileName, storagePath)
  return { content: result.content, warning: result.warning }
}

async function extractVoiceContent(
  ctx: BotContext,
  userId: string,
  detected: DetectedMessage,
): Promise<ExtractionResult> {
  const { buffer } = await downloadTelegramFile(ctx, detected.attachment!.fileId)
  const noteId = randomUUID()
  const storagePath = await uploadToStorage(userId, noteId, 'voice.ogg', buffer, 'audio/ogg')
  const duration = ctx.message?.voice?.duration
  const result = await extractVoice(buffer, storagePath, duration)
  return { content: result.content, warning: result.warning }
}

async function extractImageContent(
  ctx: BotContext,
  userId: string,
  detected: DetectedMessage,
): Promise<ExtractionResult> {
  const { buffer } = await downloadTelegramFile(ctx, detected.attachment!.fileId)
  const noteId = randomUUID()
  const fileName = 'image.jpg'
  const mimeType = detected.attachment!.mimeType ?? 'image/jpeg'
  const storagePath = await uploadToStorage(userId, noteId, fileName, buffer, mimeType)
  const result = await extractImage(buffer, storagePath, mimeType)
  return { content: result.content, warning: result.warning }
}
