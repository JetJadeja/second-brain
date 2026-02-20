import type { NoteSource, ParaTreeNode } from '@second-brain/shared'

interface ClassifyPromptParams {
  paraTree: ParaTreeNode[]
  title: string
  content: string
  summary: string | null
  sourceType: NoteSource
  userNote?: string | null
}

export function buildClassifyPrompt(params: ClassifyPromptParams): string {
  const { paraTree, title, content, summary, sourceType, userNote } = params

  const treeText = formatTree(paraTree, 0)
  const truncatedContent = content.length > 4000
    ? content.slice(0, 4000) + '\n...[truncated]'
    : content

  let prompt = `You are classifying a note into a PARA (Projects/Areas/Resources/Archive) bucket system.\n\n`
  prompt += `AVAILABLE BUCKETS:\n${treeText}\n\n`
  prompt += `NOTE TO CLASSIFY:\n`
  prompt += `Title: ${title}\n`
  prompt += `Source type: ${sourceType}\n`

  if (summary) {
    prompt += `Summary: ${summary}\n`
  }

  prompt += `Content:\n${truncatedContent}\n`

  if (userNote) {
    prompt += `\nUSER CONTEXT (THIS TAKES PRIORITY OVER CONTENT ANALYSIS): ${userNote}\n`
    prompt += `The user's stated intent for this note overrides any topic analysis. `
    prompt += `If they mention a project, area, or topic name, match it to the closest bucket.\n`
  }

  prompt += `\nRespond with ONLY valid JSON (no markdown, no code fences):\n`
  prompt += `{\n`
  prompt += `  "bucket_id": "<UUID of the best matching bucket>",\n`
  prompt += `  "confidence": <0.0 to 1.0>,\n`
  prompt += `  "tags": ["tag1", "tag2"],\n`
  prompt += `  "is_original_thought": <true if this is the user's own idea/thought, false if external content>\n`
  prompt += `}`

  return prompt
}

function formatTree(nodes: ParaTreeNode[], depth: number): string {
  let result = ''
  for (const node of nodes) {
    const indent = '  '.repeat(depth)
    result += `${indent}- ${node.name} [${node.type}] (id: ${node.id})\n`
    if (node.children.length > 0) {
      result += formatTree(node.children, depth + 1)
    }
  }
  return result
}
