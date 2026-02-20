import { getOpenAIClient } from '@second-brain/ai'
import type { ExtractedContent, VoiceMemoSource } from '@second-brain/shared'
import type { ExtractionResult } from './extract-article.js'

export async function extractVoice(
  buffer: Buffer,
  storagePath: string,
  durationSeconds: number | undefined,
): Promise<ExtractionResult> {
  const fallback = buildFallback(storagePath, durationSeconds)

  let transcript: string
  try {
    const openai = getOpenAIClient()
    const file = new File([new Uint8Array(buffer)], 'voice.ogg', { type: 'audio/ogg' })

    const result = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
    })

    transcript = result.text.trim()
  } catch (error) {
    console.error('Whisper transcription failed:', error)
    return {
      content: fallback,
      warning: "Couldn't transcribe your voice memo. Saved the audio file.",
    }
  }

  if (!transcript) {
    return {
      content: fallback,
      warning: "Couldn't transcribe your voice memo. Saved the audio file.",
    }
  }

  const firstLine = transcript.split(/[.!?]/)[0] ?? transcript
  const title = firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine

  const source: VoiceMemoSource = {
    storage_path: storagePath,
    duration_seconds: durationSeconds,
  }

  return {
    content: {
      title,
      content: transcript,
      sourceType: 'voice_memo',
      source,
    },
  }
}

function buildFallback(
  storagePath: string,
  durationSeconds: number | undefined,
): ExtractedContent {
  return {
    title: 'Voice Memo',
    content: '',
    sourceType: 'voice_memo',
    source: { storage_path: storagePath, duration_seconds: durationSeconds } as VoiceMemoSource,
  }
}
