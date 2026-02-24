import {
  callClaudeWithTools,
  type AnthropicMessageParam,
  type AnthropicContentBlock,
  type AnthropicToolResultBlockParam,
} from '@second-brain/ai'
import type { ExtractedContent } from '@second-brain/shared'
import { executeTool } from '../tools/execute-tool.js'
import { AGENT_TOOLS } from '../tools/tool-definitions.js'

export interface ToolCallResult {
  text: string
  noteIds: string[]
}

export async function handleToolCalls(
  content: AnthropicContentBlock[],
  userId: string,
  messages: AnthropicMessageParam[],
  preExtracted?: ExtractedContent,
): Promise<ToolCallResult> {
  const toolResults: AnthropicToolResultBlockParam[] = []
  const noteIds: string[] = []

  for (const block of content) {
    if (block.type === 'tool_use') {
      const result = await executeTool(
        block.name,
        block.input as Record<string, unknown>,
        { userId, preExtracted },
      )
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: result,
      })
      collectNoteIds(result, noteIds)
    }
  }

  const followUp = await callClaudeWithTools({
    system: '',
    messages: [
      ...messages,
      { role: 'assistant', content },
      { role: 'user', content: toolResults },
    ],
    tools: AGENT_TOOLS,
  })

  return { text: extractText(followUp.content), noteIds }
}

export function extractText(content: AnthropicContentBlock[]): string {
  const texts: string[] = []
  for (const block of content) {
    if (block.type === 'text' && block.text.trim()) {
      texts.push(block.text)
    }
  }
  return texts.join('\n') || 'Done!'
}

function collectNoteIds(resultJson: string, noteIds: string[]): void {
  try {
    const parsed = JSON.parse(resultJson) as Record<string, unknown>
    if (typeof parsed['noteId'] === 'string') {
      noteIds.push(parsed['noteId'])
    }
  } catch {
    // Not parseable — no note IDs to collect
  }
}
