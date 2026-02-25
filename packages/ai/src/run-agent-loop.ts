import type {
  AnthropicTool,
  AnthropicMessageParam,
  AnthropicToolResultBlockParam,
} from './providers/anthropic-tools.js'
import { callClaudeWithTools } from './providers/anthropic-tools.js'
import { extractText } from './extract-text-blocks.js'

export interface ToolCallRecord {
  name: string
  input: Record<string, unknown>
  result: string
}

export interface AgentLoopParams {
  system: string
  messages: AnthropicMessageParam[]
  tools: AnthropicTool[]
  toolExecutor: (name: string, input: Record<string, unknown>) => Promise<string>
  model?: string
  maxTokens?: number
  maxTurns?: number
}

export interface AgentLoopResult {
  text: string
  toolCalls: ToolCallRecord[]
}

const DEFAULT_MAX_TURNS = 10

export async function runAgentLoop(params: AgentLoopParams): Promise<AgentLoopResult> {
  const { system, tools, toolExecutor, model, maxTokens, maxTurns = DEFAULT_MAX_TURNS } = params
  const messages: AnthropicMessageParam[] = [...params.messages]
  const allToolCalls: ToolCallRecord[] = []

  for (let turn = 0; turn < maxTurns; turn++) {
    const response = await callClaudeWithTools({ system, messages, tools, model, maxTokens })

    if (response.stop_reason !== 'tool_use') {
      return { text: extractText(response.content), toolCalls: allToolCalls }
    }

    const toolResults: AnthropicToolResultBlockParam[] = []

    for (const block of response.content) {
      if (block.type !== 'tool_use') continue

      const input = block.input as Record<string, unknown>
      const result = await executeToolSafe(toolExecutor, block.name, input)

      allToolCalls.push({ name: block.name, input, result })
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result })
    }

    messages.push({ role: 'assistant', content: response.content })
    messages.push({ role: 'user', content: toolResults })
  }

  return { text: 'I was unable to complete this request.', toolCalls: allToolCalls }
}

async function executeToolSafe(
  executor: (name: string, input: Record<string, unknown>) => Promise<string>,
  name: string,
  input: Record<string, unknown>,
): Promise<string> {
  try {
    return await executor(name, input)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[agent-loop] tool "${name}" failed:`, msg)
    return JSON.stringify({ error: msg })
  }
}
