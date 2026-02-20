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

  let prompt = `Summarize this ${sourceType} in 2-3 concise sentences. `
  prompt += `Capture the core insight or main point, not just what it's about. `
  prompt += `Be specific and informative.\n\n`
  prompt += `Title: ${title}\n\n`
  prompt += `Content:\n${truncated}`

  if (userNote) {
    prompt += `\n\nUser's context: ${userNote}`
  }

  prompt += `\n\nRespond with ONLY the summary, no preamble or labels.`

  return prompt
}
