import {
  callClaudeWithTools,
  type AnthropicMessageParam,
  type AnthropicToolResultBlockParam,
} from '@second-brain/ai'
import { getAllBuckets } from '@second-brain/db'
import { buildParaTree } from '@second-brain/shared'
import type { ConversationEntry, ExtractedContent } from '@second-brain/shared'
import type { BotContext } from '../context.js'
import { loadHistory } from '../conversation/load-history.js'
import { buildAgentSystemPrompt } from './system-prompt.js'
import { AGENT_TOOLS } from './tools/tool-definitions.js'
import { executeTool } from './tools/execute-tool.js'
import { buildUserMessage } from './build-user-message.js'
import { preExtractAttachment } from './pre-extract.js'

export interface AgentResult {
  text: string
  noteIds: string[]
}

export async function runAgent(
  ctx: BotContext,
  noteContext?: string,
): Promise<AgentResult> {
  const userId = ctx.userId
  if (!userId) return { text: 'Something went wrong.', noteIds: [] }

  const [history, buckets, preExtracted] = await Promise.all([
    loadHistory(userId),
    getAllBuckets(userId),
    preExtractAttachment(ctx, userId),
  ])

  const paraTree = buildParaTree(buckets)
  const system = buildAgentSystemPrompt({ bucketTree: paraTree, noteContext })
  const messages = buildMessages(history, ctx, preExtracted?.description)

  const response = await callClaudeWithTools({
    system,
    messages,
    tools: AGENT_TOOLS,
  })

  const noteIds: string[] = []

  if (response.stop_reason === 'tool_use') {
    const result = await handleToolCalls(
      response.content, userId, ctx, messages, preExtracted?.extracted,
    )
    noteIds.push(...result.noteIds)
    return { text: result.text, noteIds }
  }

  const text = extractText(response.content)
  return { text, noteIds }
}

function buildMessages(
  history: ConversationEntry[],
  ctx: BotContext,
  attachmentDescription?: string,
): AnthropicMessageParam[] {
  const messages: AnthropicMessageParam[] = []

  for (const entry of history) {
    messages.push({
      role: entry.role === 'user' ? 'user' : 'assistant',
      content: entry.content,
    })
  }

  let userMessage = buildUserMessage(ctx)
  if (attachmentDescription) {
    userMessage = attachmentDescription + '\n' + userMessage
  }

  messages.push({ role: 'user', content: userMessage })
  return messages
}

async function handleToolCalls(
  content: import('@second-brain/ai').AnthropicContentBlock[],
  userId: string,
  ctx: BotContext,
  messages: AnthropicMessageParam[],
  preExtracted?: ExtractedContent,
): Promise<AgentResult> {
  const toolResults: AnthropicToolResultBlockParam[] = []
  const noteIds: string[] = []

  for (const block of content) {
    if (block.type === 'tool_use') {
      const result = await executeTool(
        block.name,
        block.input as Record<string, unknown>,
        { userId, ctx, preExtracted },
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

function extractText(
  content: import('@second-brain/ai').AnthropicContentBlock[],
): string {
  const texts: string[] = []
  for (const block of content) {
    if (block.type === 'text' && block.text.trim()) {
      texts.push(block.text)
    }
  }
  return texts.join('\n') || "Done!"
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
