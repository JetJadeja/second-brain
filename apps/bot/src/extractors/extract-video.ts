import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFile, readFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { getOpenAIClient } from '@second-brain/ai'
import type { ExtractedContent, VideoSource } from '@second-brain/shared'

const execFileAsync = promisify(execFile)
const MAX_AUDIO_SIZE = 25 * 1024 * 1024 // 25MB Whisper limit

interface ExtractionResult {
  content: ExtractedContent
  warning?: string
}

export async function extractVideo(
  buffer: Buffer,
  storagePath: string,
  durationSeconds: number | undefined,
): Promise<ExtractionResult> {
  const fallback = buildFallback(storagePath, durationSeconds)

  const audioBuffer = await extractAudio(buffer)
  if (!audioBuffer) {
    return { content: fallback, warning: "Couldn't extract audio from video. Saved the video file." }
  }

  if (audioBuffer.length > MAX_AUDIO_SIZE) {
    return { content: fallback, warning: 'Video audio is too long to transcribe. Saved the video file.' }
  }

  let transcript: string
  try {
    const openai = getOpenAIClient()
    const file = new File([new Uint8Array(audioBuffer)], 'audio.ogg', { type: 'audio/ogg' })

    const result = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file,
    })

    transcript = result.text.trim()
  } catch (error) {
    console.error('[extract-video] Whisper transcription failed:', error)
    return { content: fallback, warning: "Couldn't transcribe video audio. Saved the video file." }
  }

  if (!transcript) {
    return { content: fallback, warning: "Couldn't transcribe video audio. Saved the video file." }
  }

  const firstLine = transcript.split(/[.!?]/)[0] ?? transcript
  const title = firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine

  const source: VideoSource = {
    storage_path: storagePath,
    duration_seconds: durationSeconds,
  }

  return {
    content: { title, content: transcript, sourceType: 'video', source },
  }
}

async function extractAudio(videoBuffer: Buffer): Promise<Buffer | null> {
  const id = randomUUID()
  const inputPath = join(tmpdir(), `sb-video-${id}.mp4`)
  const outputPath = join(tmpdir(), `sb-audio-${id}.ogg`)

  try {
    await writeFile(inputPath, videoBuffer)

    await execFileAsync('ffmpeg', [
      '-i', inputPath,
      '-vn', '-acodec', 'libopus', '-b:a', '48k',
      '-y', outputPath,
    ], { timeout: 60_000 })

    return await readFile(outputPath)
  } catch (error) {
    console.error('[extract-video] ffmpeg audio extraction failed:', error)
    return null
  } finally {
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
  }
}

function buildFallback(
  storagePath: string,
  durationSeconds: number | undefined,
): ExtractedContent {
  return {
    title: 'Video',
    content: '',
    sourceType: 'video',
    source: { storage_path: storagePath, duration_seconds: durationSeconds } as VideoSource,
  }
}
