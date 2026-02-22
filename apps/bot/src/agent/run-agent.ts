import {
  callClaudeWithTools,
  type AnthropicMessageParam,
} from '@second-brain/ai'
import { getAllBuckets } from '@second-brain/db'
import { buildParaTree } from '@second-brain/shared'
import type { ConversationEntry } from '@second-brain/shared'
import type { BotContext } from '../context.js'
import { loadHistory } from '../conversation/load-history.js'
import { buildAgentSystemPrompt } from './system-prompt.js'
import { AGENT_TOOLS } from './tools/tool-definitions.js'
import { buildUserMessage } from './build-user-message.js'
import { preExtractAttachment } from './pre-extract.js'
import { handleToolCalls, extractText } from './handle-tool-calls.js'

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
