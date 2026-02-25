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
    prompt += `\n\nUser's context (this is the STRONGEST signal for the title): "${userNote}"`
  }

  prompt += `\n\nRespond with JSON only — no markdown, no preamble:\n`
  prompt += `{"title": "...", "summary": "..."}\n\n`
  prompt += `TITLE RULES:\n`
  prompt += `- 40-80 characters. Short and scannable.\n`
  prompt += `- Describe what this content IS, not what the page is called.\n`
  prompt += `- If user context is provided, use it as the primary signal.\n`
  prompt += `- Strip site names, SEO text, and marketing copy.\n`
  prompt += `- No quotes, no colons at the start, no "Article:" prefixes.\n\n`
  prompt += `SUMMARY RULES:\n`
  prompt += `- 2-3 concise sentences capturing the core insight.\n`
  prompt += `- Be specific and informative, not vague.\n`

  return prompt
}
