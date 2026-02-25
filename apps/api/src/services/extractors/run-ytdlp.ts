import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface YtDlpMetadata {
  title?: string
  description?: string
  uploader?: string
  channel?: string
  thumbnail?: string
  duration?: number
  subtitles?: Record<string, Array<{ url: string; ext: string }>>
  thumbnails?: Array<{ url: string; id?: string; width?: number; height?: number }>
}

export async function fetchYtDlpMetadata(url: string): Promise<YtDlpMetadata | null> {
  try {
    const { stdout } = await execFileAsync('yt-dlp', ['--dump-json', '--no-download', url], {
      timeout: 30_000,
    })

    return JSON.parse(stdout) as YtDlpMetadata
  } catch (error) {
    console.error('yt-dlp failed:', error)
    return null
  }
}
