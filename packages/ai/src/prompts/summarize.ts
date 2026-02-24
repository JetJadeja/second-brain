import type { NoteSource } from '@second-brain/shared'

interface SummarizePromptParams {
  title: string
  content: string
  sourceType: NoteSource
  userNote?: string | null
}

export function buildSummarizePrompt(params: SummarizePromptParams): string {
  const { title, content, sourceType, userNote } = params

  const truncated = content.length > 6000
    ? content.slice(0, 6000) + '\n...[truncated]'
    : content

  let prompt = `Summarize this ${sourceType}. Extract the specific, unique information — `
  prompt += `facts, names, numbers, steps, frameworks, key arguments. `
  prompt += `Someone reading only the summary should learn the key details without reading the original.\n\n`
  prompt += `LENGTH: Scale with content. For short content (a tweet or brief thought), 1-2 sentences. `
  prompt += `For medium content, 2-4 sentences. For long articles, a detailed paragraph with specific data points.\n\n`
  prompt += `Title: ${title}\n\n`
  prompt += `Content:\n${truncated}`

  if (userNote) {
    prompt += `\n\nUser's context: ${userNote}`
  }

  prompt += `\n\nRespond with ONLY the summary, no preamble or labels.`

  return prompt
}
