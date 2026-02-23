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

  let prompt = `Analyze this ${sourceType} and produce a short title and summary.\n\n`
  prompt += `Original title: ${title}\n\n`
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
