import Anthropic from '@anthropic-ai/sdk'
import { getClient, DEFAULT_MODEL } from './anthropic.js'
import { withRetry } from './with-retry.js'

export type AnthropicTool = Anthropic.Tool
export type AnthropicMessage = Anthropic.Message
export type AnthropicMessageParam = Anthropic.MessageParam
export type AnthropicContentBlock = Anthropic.ContentBlock
export type AnthropicToolUseBlock = Anthropic.ToolUseBlock
export type AnthropicToolResultBlockParam = Anthropic.ToolResultBlockParam

interface CallClaudeWithToolsParams {
  messages: Anthropic.MessageParam[]
  system: string
  tools: Anthropic.Tool[]
  model?: string
  maxTokens?: number
}

export async function callClaudeWithTools(
  params: CallClaudeWithToolsParams,
): Promise<Anthropic.Message> {
  const { messages, system, tools, model = DEFAULT_MODEL, maxTokens = 4096 } = params
  const anthropic = getClient()

  const request: Anthropic.MessageCreateParams = {
    model,
    max_tokens: maxTokens,
    system,
    messages,
    tools,
  }

  return withRetry(() => anthropic.messages.create(request))
}
